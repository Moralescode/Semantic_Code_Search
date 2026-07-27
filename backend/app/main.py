# -*- coding: utf-8 -*-
"""
API REST FastAPI pour CodeMind
ElevenLabs endpoints for voice synthesis.
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field
from typing import List, Optional
import time, json, os, requests
from retrieval.search import CodeSearchEngine
from llm.llm_explainer import CodeExplainer
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def cf(): return os.path.join(ROOT, "configs", "config.yaml")
def cp(): return os.path.join(ROOT, "data", "processed_corpus.jsonl")
def hp(): return os.path.join(ROOT, "data", "search_history.jsonl")

with open(cf(), encoding="utf-8") as f: cfg = yaml.safe_load(f)

EL_API_KEY = cfg.get("elevenlabs", {}).get("api_key", os.environ.get("ELEVENLABS_API_KEY", ""))
EL_VOICE = cfg.get("elevenlabs", {}).get("default_voice_id", "EXAVITQu4vrRV9E3zY0")
EL_MODEL = cfg.get("elevenlabs", {}).get("model_id", "eleven_monolingual_v1")
EL_STAB = cfg.get("elevenlabs", {}).get("stability", 0.5)
EL_SIM = cfg.get("elevenlabs", {}).get("similarity_boost", 0.75)
EL_STYLE = cfg.get("elevenlabs", {}).get("style", 0.3)
EL_BOOST = cfg.get("elevenlabs", {}).get("use_speaker_boost", True)
EL_BASE = "https://api.elevenlabs.io/v1"

app = FastAPI(title="CodeMind API", version="2.4.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# Pydantic models
class SearchRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=500)
    language: Optional[str] = None
    top_k: int = 5
    use_rerank: bool = True
    use_baseline: bool = False

class CodeSearchResult(BaseModel):
    id: Optional[str] = None
    name: str
    language: str
    docstring: str
    code: str
    arguments: List[str]
    score: float

class SearchResponse(BaseModel):
    query: str; language_filter: Optional[str]; results: List[CodeSearchResult]; latency_ms: float

class ExplainRequest(BaseModel):
    name: str = ""; language: str = "python"; code: str = ""; docstring: str = ""

class ExplainResponse(BaseModel):
    explanation: str

class ElevenLabsSpeakRequest(BaseModel):
    text: str; voice_id: Optional[str] = None; api_key: Optional[str] = None

class ElevenLabsVoicesResponse(BaseModel):
    voices: List[dict]; default_voice: str

class ElevenLabsTestResponse(BaseModel):
    success: bool; message: str; api_key_configured: bool

# Globals
search_engine = None
explainer = None

@app.on_event("startup")
def startup():
    global search_engine, explainer
    try:
        search_engine = CodeSearchEngine()
        explainer = CodeExplainer()
        print("CodeMind v2.4 demarree !")
        if EL_API_KEY:
            print(f"ElevenLabs configure avec cle API (debut: {EL_API_KEY[:8]}...)")
        else:
            print("ElevenLabs: fallback navigateur utilise")
    except Exception as e:
        print(f"Init error: {e}")

# ======================================================================
# ELEVENLABS ENDPOINTS
# ======================================================================

@app.get("/voices", response_model=ElevenLabsVoicesResponse)
def list_voices(api_key: Optional[str] = Query(None)):
    """Liste les voix disponibles sur ElevenLabs."""
    key = api_key or EL_API_KEY
    default_voices = [
        {"id": "EXAVITQu4vrRV9E3zY0", "name": "Bella", "gender": "female"},
        {"id": "21m00Tcm4TlvDq8ikWAM", "name": "Rachel", "gender": "female"},
        {"id": "pNInz6obpgDQGcFmaJgB", "name": "Adam", "gender": "male"},
        {"id": "ErXwobaYiN019PkySvjV", "name": "Antoni", "gender": "male"},
        {"id": "MF3mGyEYCl7XYWbV9V6O", "name": "Elli", "gender": "female"},
        {"id": "yoZ06aMxZJJ28mfd3POQ", "name": "Sam", "gender": "male"},
    ]
    if not key:
        return {"voices": default_voices, "default_voice": EL_VOICE}
    try:
        r = requests.get(f"{EL_BASE}/voices", headers={"xi-api-key": key}, timeout=10)
        if r.status_code == 200:
            data = r.json()
            voices = [{"id": v["voice_id"], "name": v["name"], "gender": v.get("labels", {}).get("gender", "unknown")} for v in data.get("voices", [])]
            return {"voices": voices, "default_voice": EL_VOICE}
        return {"voices": default_voices, "default_voice": EL_VOICE}
    except Exception:
        return {"voices": default_voices, "default_voice": EL_VOICE}

@app.post("/speak")
def speak_text(request: ElevenLabsSpeakRequest):
    """Synthetise un texte en audio via ElevenLabs."""
    key = request.api_key or EL_API_KEY
    if not key:
        raise HTTPException(400, "Aucune cle API ElevenLabs configuree")
    voice_id = request.voice_id or EL_VOICE
    try:
        r = requests.post(f"{EL_BASE}/text-to-speech/{voice_id}",
            headers={"Accept": "audio/mpeg", "Content-Type": "application/json", "xi-api-key": key},
            json={"text": request.text, "model_id": EL_MODEL,
                  "voice_settings": {"stability": EL_STAB, "similarity_boost": EL_SIM, "style": EL_STYLE, "use_speaker_boost": EL_BOOST}},
            timeout=30)
        if not r.ok:
            raise HTTPException(r.status_code, f"ElevenLabs error: {r.text}")
        return Response(content=r.content, media_type="audio/mpeg")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(503, f"Erreur ElevenLabs: {str(e)}")

@app.post("/test_elevenlabs", response_model=ElevenLabsTestResponse)
def test_elevenlabs(api_key: Optional[str] = Query(None)):
    """Teste la connexion a l'API ElevenLabs."""
    key = api_key or EL_API_KEY
    if not key:
        return {"success": False, "message": "Aucune cle API configuree", "api_key_configured": False}
    try:
        r = requests.get(f"{EL_BASE}/voices", headers={"xi-api-key": key}, timeout=10)
        if r.status_code == 200:
            data = r.json()
            nb = len(data.get("voices", []))
            return {"success": True, "message": f"Connexion reussie ! {nb} voix disponibles.", "api_key_configured": True}
        elif r.status_code == 401:
            return {"success": False, "message": "Cle API invalide", "api_key_configured": True}
        return {"success": False, "message": f"Erreur API: {r.status_code}", "api_key_configured": True}
    except Exception as e:
        return {"success": False, "message": f"Erreur de connexion: {str(e)}", "api_key_configured": True}


@app.get("/languages")
def list_languages():
    """Retourne la liste des langages supports par CodeMind (CodeSearchNet + NexaTech)."""
    return {
        "languages": [
            {"id": "python", "label": "Python", "emoji": "🐍"},
            {"id": "javascript", "label": "JavaScript", "emoji": "🟨"},
            {"id": "go", "label": "Go", "emoji": "🔵"},
            {"id": "java", "label": "Java", "emoji": "☕"},
            {"id": "php", "label": "PHP", "emoji": "🐘"},
            {"id": "ruby", "label": "Ruby", "emoji": "💎"},
        ]
    }

# ======================================================================
# EXISTING ENDPOINTS
# ======================================================================

def get_corpus_data():
    entries = []
    p = cp()
    if os.path.exists(p):
        with open(p, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    try: entries.append(json.loads(line))
                    except: pass
    return entries

@app.get('/')
def root():
    return {'message': 'CodeMind API v2.4 - NexaTech Solutions', 'docs': '/docs', 'elevenlabs': bool(EL_API_KEY)}

@app.get('/health')
def health():
    global search_engine
    if search_engine is None:
        return {'status': 'starting'}
    try:
        bl = search_engine.baseline_index_manager.index.ntotal > 0
        fl = search_engine.finetuned_index_manager.index.ntotal > 0
        return {'status': 'healthy' if (bl or fl) else 'degraded', 'baseline': bl, 'finetuned': fl, 'device': str(search_engine.device), 'elevenlabs': bool(EL_API_KEY)}
    except:
        return {'status': 'error'}

@app.get('/corpus')
def list_corpus():
    entries = get_corpus_data()
    return {'total': len(entries), 'entries': entries}

@app.post('/search', response_model=SearchResponse)
def search_code(req: SearchRequest):
    global search_engine
    if search_engine is None:
        raise HTTPException(503, 'Moteur non initialise')
    start = time.time()
    try:
        results = search_engine.search(query=req.query, language=req.language, top_k=req.top_k, use_rerank=req.use_rerank, use_baseline=req.use_baseline)
    except Exception as e:
        raise HTTPException(500, str(e))
    return {'query': req.query, 'language_filter': req.language, 'results': results, 'latency_ms': round((time.time()-start)*1000, 2)}

@app.post('/save_search')
def save_search(query: str = '', language: str = '', results_count: int = 0):
    try:
        history = []
        hp_path = hp()
        if os.path.exists(hp_path):
            with open(hp_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line:
                        try: history.append(json.loads(line))
                        except: pass
        entry = {'query': query, 'language': language, 'results_count': results_count, 'timestamp': time.time()}
        history.append(entry)
        with open(hp_path, 'w', encoding='utf-8') as f:
            for item in history[-100:]:
                f.write(json.dumps(item) + chr(10))
        return {'success': True}
    except Exception as e:
        return {'success': False, 'error': str(e)}

@app.get('/search_history')
def get_search_history(limit: int = 100):
    history = []
    hp_path = hp()
    if os.path.exists(hp_path):
        with open(hp_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    try: history.append(json.loads(line))
                    except: pass
    return history[-limit:]

@app.post('/explain', response_model=ExplainResponse)
def explain_code(req: ExplainRequest):
    global explainer
    if explainer is None:
        explainer = CodeExplainer()
    try:
        expl = explainer.explain(func_name=req.name, language=req.language, code=req.code, docstring=req.docstring)
        return {'explanation': expl}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post('/translate')
def translate_code(req: dict):
    global explainer
    if explainer is None: explainer = CodeExplainer()
    try:
        result = explainer.translate_code(req.get('code', ''), req.get('source_language', 'python'), req.get('target_language', 'javascript'))
        return {'translated_code': result}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post('/generate')
def generate_code(req: dict):
    global explainer
    if explainer is None: explainer = CodeExplainer()
    try:
        result = explainer.generate_code(req.get('description', ''), req.get('language', 'python'))
        return result
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post('/index_code')
def index_code(req: dict):
    try:
        entry = {'name': req.get('name', ''), 'language': req.get('language', 'python'), 'docstring': req.get('docstring', ''), 'code': req.get('code', ''), 'arguments': ['x']}
        entries = get_corpus_data()
        entries.append(entry)
        with open(cp(), 'w', encoding='utf-8') as f:
            for item in entries:
                f.write(json.dumps(item) + chr(10))
        return {'success': True, 'message': 'Code indexe dans FAISS'}
    except Exception as e:
        return {'success': False, 'message': str(e)}

@app.post('/audit')
def audit_code(req: dict):
    global explainer
    if explainer is None: explainer = CodeExplainer()
    try:
        return explainer.audit_code(req.get('code', ''), req.get('language', 'python'))
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post('/optimize')
def optimize_code(req: dict):
    global explainer
    if explainer is None: explainer = CodeExplainer()
    try:
        return explainer.optimize_code(req.get('code', ''), req.get('language', 'python'))
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post('/docstring')
def generate_docstring(req: dict):
    global explainer
    if explainer is None: explainer = CodeExplainer()
    try:
        return {'documented_code': explainer.generate_docstring(req.get('code', ''), req.get('language', 'python'))}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post('/patch_security')
def patch_security(req: dict):
    global explainer
    if explainer is None: explainer = CodeExplainer()
    try:
        return explainer.patch_security_vuln(req.get('code', ''), req.get('language', 'python'))
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post('/openapi_spec')
def openapi_spec(req: dict):
    global explainer
    if explainer is None: explainer = CodeExplainer()
    try:
        return {'openapi_spec': explainer.generate_openapi_spec(req.get('name', ''), req.get('code', ''), req.get('language', 'python'))}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post('/copilot_chat')
def copilot_chat(req: dict):
    global explainer
    if explainer is None: explainer = CodeExplainer()
    try:
        return {'response': explainer.copilot_chat(req.get('message', ''), req.get('history', []), req.get('retrieval_context', ''))}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post('/refactor_duplicate')
def refactor_duplicate(req: dict):
    global explainer
    if explainer is None: explainer = CodeExplainer()
    try:
        return explainer.refactor_duplicate(req.get('code1', ''), req.get('code2', ''), req.get('language', 'python'))
    except Exception as e:
        raise HTTPException(500, str(e))
