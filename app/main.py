# -*- coding: utf-8 -*-
"""
API REST FastAPI pour CodeMind - Moteur de recherche sémantique de code de NexaTech Solutions.
Expose des routes pour la recherche sémantique, la vérification de santé (health check)
et l'explication/optimisation/traduction/audit/docstring/refactoring/patching/copilot de code via LLM.
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import time

from retrieval.search import CodeSearchEngine
from llm.llm_explainer import CodeExplainer
from retrieval.faiss_index import FAISSIndexManager
from transformers import BertTokenizer
from models.bi_encoder import BiEncoder
import faiss
import numpy as np
import os
import json
import yaml
import torch

app = FastAPI(
    title="CodeMind API",
    description="API REST de recherche sémantique de code pour NexaTech Solutions (Abidjan, Côte d'Ivoire)",
    version="2.3.0"
)

# Configuration CORS pour autoriser l'accès depuis le frontend Streamlit
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modèles de données Pydantic
class SearchRequest(BaseModel):
    query: str = Field(..., description="La requête en langage naturel (ex: 'validate phone number')", min_length=2, max_length=500)
    language: Optional[str] = Field(None, description="Langage cible pour filtrer : 'python' ou 'javascript'")
    top_k: int = Field(5, ge=1, le=20, description="Nombre de résultats souhaités")
    use_rerank: bool = Field(True, description="Activer le réordonnancement par Cross-Encoder")
    use_baseline: bool = Field(False, description="Utiliser l'index baseline de référence (non optimisé)")

class CodeSearchResult(BaseModel):
    name: str
    language: str
    docstring: str
    code: str
    arguments: List[str]
    score: float

class SearchResponse(BaseModel):
    query: str
    language_filter: Optional[str]
    results: List[CodeSearchResult]
    latency_ms: float

class ExplainRequest(BaseModel):
    name: str
    language: str
    code: str
    docstring: str

class ExplainResponse(BaseModel):
    explanation: str

# MODÈLES DE DONNÉES IA v2.3
class TranslateRequest(BaseModel):
    code: str
    source_language: str
    target_language: str

class TranslateResponse(BaseModel):
    translated_code: str

class GenerateRequest(BaseModel):
    description: str
    language: str

class GenerateResponse(BaseModel):
    name: str
    docstring: str
    code: str

class AuditRequest(BaseModel):
    code: str
    language: str

class AuditResponse(BaseModel):
    grade: str
    vulnerabilities: List[str]
    recommendations: List[str]
    efficiency_tip: str

class OptimizeRequest(BaseModel):
    code: str
    language: str

class OptimizeResponse(BaseModel):
    optimized_code: str
    complexity_before: str
    complexity_after: str
    explanation: str

class DocstringRequest(BaseModel):
    code: str
    language: str

class DocstringResponse(BaseModel):
    documented_code: str

class RefactorRequest(BaseModel):
    code1: str
    code2: str
    language: str

class RefactorResponse(BaseModel):
    unified_name: str
    unified_code: str
    refactor_explanation: str

class PatchRequest(BaseModel):
    code: str
    language: str

class PatchResponse(BaseModel):
    patched_code: str
    fixed_vulnerabilities: str
    new_grade: str

class OpenApiRequest(BaseModel):
    name: str
    code: str
    language: str

class OpenApiResponse(BaseModel):
    openapi_spec: str

class ChatItem(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatItem]

class ChatResponse(BaseModel):
    response: str

# Variable globale pour stocker l'instance du moteur de recherche
search_engine = None
explainer = None

@app.on_event("startup")
def startup_event():
    global search_engine, explainer
    try:
        search_engine = CodeSearchEngine()
        explainer = CodeExplainer()
        print("API CodeMind v2.3 démarrée avec succès !")
    except Exception as e:
        print(f"Erreur d'initialisation du moteur au démarrage : {e}")

@app.get("/", tags=["Général"])
def read_root():
    return {
        "message": "Bienvenue sur l'API sémantique CodeMind v2.3 de NexaTech Solutions.",
        "documentation": "/docs",
        "status": "online"
    }

@app.get("/health", tags=["Général"])
def health_check():
    """
    Vérifie l'état de l'API et la disponibilité des index vectoriels FAISS.
    """
    global search_engine
    if search_engine is None:
        try:
            search_engine = CodeSearchEngine()
        except Exception:
            return {"status": "error", "message": "Le moteur de recherche n'a pas pu être initialisé"}

    baseline_loaded = search_engine.baseline_index_manager.index.ntotal > 0
    finetuned_loaded = search_engine.finetuned_index_manager.index.ntotal > 0
    
    return {
        "status": "healthy" if (baseline_loaded or finetuned_loaded) else "degraded",
        "timestamp": time.time(),
        "index_info": {
            "baseline_vectors_count": search_engine.baseline_index_manager.index.ntotal,
            "finetuned_vectors_count": search_engine.finetuned_index_manager.index.ntotal,
            "baseline_healthy": baseline_loaded,
            "finetuned_healthy": finetuned_loaded
        },
        "device": str(search_engine.device)
    }

class IndexCodeRequest(BaseModel):
    name: str
    language: str
    docstring: str
    code: str
    arguments: List[str] = []

class IndexCodeResponse(BaseModel):
    success: bool
    message: str
    faiss_id: str

@app.post("/index_code", response_model=IndexCodeResponse, tags=["Recherche"])
def index_code(request: IndexCodeRequest):
    """
    Indexe dynamiquement une nouvelle fonction dans le corpus et l'index FAISS finetuné.
    """
    global search_engine
    if search_engine is None:
        raise HTTPException(status_code=503, detail="Le moteur de recherche est en cours d'initialisation.")

    try:
        corpus_path = "data/processed_corpus.jsonl"
        entry = {
            "name": request.name,
            "language": request.language,
            "docstring": request.docstring,
            "code": request.code,
            "arguments": request.arguments
        }
        with open(corpus_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

        with open("configs/config.yaml", "r", encoding="utf-8") as f:
            config = yaml.safe_load(f)

        device = search_engine.device
        base_model_name = config["model"]["base_model_name"]
        finetuned_model_path = config["model"]["finetuned_model_path"]
        max_seq_length = config["training"]["max_seq_length"]

        if os.path.exists(finetuned_model_path):
            encoder = BiEncoder.from_pretrained(
                save_directory=finetuned_model_path,
                base_model_name=base_model_name,
                use_lora=config["model"]["use_lora"]
            ).to(device)
        else:
            encoder = search_engine.finetuned_encoder

        encoder.eval()
        tokenizer = BertTokenizer.from_pretrained(base_model_name)

        text_to_encode = f"[{request.language}] function {request.name}: {request.docstring}"
        inputs = tokenizer(
            text_to_encode,
            max_length=max_seq_length,
            padding="max_length",
            truncation=True,
            return_tensors="pt"
        ).to(device)

        with torch.no_grad():
            embedding = encoder.encode(inputs["input_ids"], inputs["attention_mask"]).cpu().numpy()[0]

        index_manager = search_engine.finetuned_index_manager
        index_manager.add_vectors(np.array([embedding]), [entry])
        index_manager.save()

        faiss_id = str(index_manager.index.ntotal - 1)

        if hasattr(search_engine.finetuned_index_manager, 'load'):
            search_engine.finetuned_index_manager.load()

        return IndexCodeResponse(success=True, message="Fonction indexée avec succès dans FAISS", faiss_id=faiss_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'indexation : {str(e)}")

@app.post("/search", response_model=SearchResponse, tags=["Recherche"])
def search_code(request: SearchRequest):
    """
    Recherche sémantique de code source dans le corpus indexé de NexaTech.
    """
    global search_engine
    if search_engine is None:
        raise HTTPException(status_code=503, detail="Le moteur de recherche est en cours d'initialisation.")
        
    start_time = time.time()
    try:
        expanded_query = request.query
        if len(request.query.split()) < 3 and explainer is not None:
            expanded_query = explainer.expand_query(request.query)
            print(f"Requête courte expansée sémantiquement : '{request.query}' -> '{expanded_query}'")

        results = search_engine.search(
            query=expanded_query,
            language=request.language,
            top_k=request.top_k,
            use_rerank=request.use_rerank,
            use_baseline=request.use_baseline
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur interne du moteur de recherche : {str(e)}")
        
    latency_ms = (time.time() - start_time) * 1000
    
    return SearchResponse(
        query=request.query,
        language_filter=request.language,
        results=results,
        latency_ms=round(latency_ms, 2)
    )

@app.post("/explain", response_model=ExplainResponse, tags=["Services IA"])
def explain_code(request: ExplainRequest):
    """
    Génère une explication didactique et contextuelle du code source transmis.
    """
    global explainer
    if explainer is None:
        explainer = CodeExplainer()
        
    try:
        explanation = explainer.explain(
            func_name=request.name,
            language=request.language,
            code=request.code,
            docstring=request.docstring
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur d'explication du code : {str(e)}")
        
    return ExplainResponse(explanation=explanation)

@app.post("/translate", response_model=TranslateResponse, tags=["Services IA"])
def translate_code_endpoint(request: TranslateRequest):
    """
    Traduit du code source d'un langage à un autre en conservant la structure.
    """
    global explainer
    if explainer is None:
        explainer = CodeExplainer()
    try:
        translated = explainer.translate_code(request.code, request.source_language, request.target_language)
        return TranslateResponse(translated_code=translated)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate", response_model=GenerateResponse, tags=["Services IA"])
def generate_code_endpoint(request: GenerateRequest):
    """
    Génère du code propre et documenté à partir d'une description naturelle.
    """
    global explainer
    if explainer is None:
        explainer = CodeExplainer()
    try:
        generated = explainer.generate_code(request.description, request.language)
        return GenerateResponse(
            name=generated["name"],
            docstring=generated["docstring"],
            code=generated["code"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/audit", response_model=AuditResponse, tags=["Services IA"])
def audit_code_endpoint(request: AuditRequest):
    """
    Audite sémantiquement la sécurité et la qualité du code fourni.
    """
    global explainer
    if explainer is None:
        explainer = CodeExplainer()
    try:
        audited = explainer.audit_code(request.code, request.language)
        return AuditResponse(
            grade=audited["grade"],
            vulnerabilities=audited["vulnerabilities"],
            recommendations=audited["recommendations"],
            efficiency_tip=audited["efficiency_tip"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/optimize", response_model=OptimizeResponse, tags=["Services IA"])
def optimize_code_endpoint(request: OptimizeRequest):
    """
    Optimise les performances algorithmiques et réduit la complexité du code.
    """
    global explainer
    if explainer is None:
        explainer = CodeExplainer()
    try:
        optimized = explainer.optimize_code(request.code, request.language)
        return OptimizeResponse(
            optimized_code=optimized["optimized_code"],
            complexity_before=optimized["complexity_before"],
            complexity_after=optimized["complexity_after"],
            explanation=optimized["explanation"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/docstring", response_model=DocstringResponse, tags=["Services IA"])
def docstring_endpoint(request: DocstringRequest):
    """
    Rédige automatiquement une documentation JSDoc ou Google-style pour la fonction transmise.
    """
    global explainer
    if explainer is None:
        explainer = CodeExplainer()
    try:
        documented = explainer.generate_docstring(request.code, request.language)
        return DocstringResponse(documented_code=documented)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/refactor_duplicate", response_model=RefactorResponse, tags=["Services IA"])
def refactor_duplicate_endpoint(request: RefactorRequest):
    """
    Fusionne et refactore deux fonctions redondantes en une seule fonction robuste.
    """
    global explainer
    if explainer is None:
        explainer = CodeExplainer()
    try:
        refactored = explainer.refactor_duplicate(request.code1, request.code2, request.language)
        return RefactorResponse(
            unified_name=refactored["unified_name"],
            unified_code=refactored["unified_code"],
            refactor_explanation=refactored["refactor_explanation"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/patch_security", response_model=PatchResponse, tags=["Services IA"])
def patch_security_endpoint(request: PatchRequest):
    """
    Analyse un code vulnérable et génère une version sécurisée unifiée (remediation).
    """
    global explainer
    if explainer is None:
        explainer = CodeExplainer()
    try:
        patched = explainer.patch_security_vuln(request.code, request.language)
        return PatchResponse(
            patched_code=patched["patched_code"],
            fixed_vulnerabilities=patched["fixed_vulnerabilities"],
            new_grade=patched["new_grade"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/openapi_spec", response_model=OpenApiResponse, tags=["Services IA"])
def openapi_spec_endpoint(request: OpenApiRequest):
    """
    Génère une spécification d'API OpenAPI 3.0 valide au format JSON pour exposer la fonction.
    """
    global explainer
    if explainer is None:
        explainer = CodeExplainer()
    try:
        spec = explainer.generate_openapi_spec(request.name, request.code, request.language)
        return OpenApiResponse(openapi_spec=spec)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ======================================================================
# EXPOSITION REST DES NOUVELLES FONCTIONNALITÉS IA v2.3 (Chatbot CoPilot)
# ======================================================================

@app.post("/copilot_chat", response_model=ChatResponse, tags=["Services IA"])
def copilot_chat_endpoint(request: ChatRequest):
    """
    Communique de manière conversationnelle avec l'assistant de dépôt CoPilot.
    """
    global explainer, search_engine
    if explainer is None:
        explainer = CodeExplainer()
    try:
        history_list = [{"role": item.role, "content": item.content} for item in request.history]
        print("DEBUG: calling copilot_chat", flush=True)
        resp = explainer.copilot_chat(request.message, history_list, retrieval_context="")
        print("DEBUG: copilot_chat done", flush=True)
        return ChatResponse(response=resp)
    except Exception as e:
        print("DEBUG: copilot_chat error", e, flush=True)
        raise HTTPException(status_code=500, detail=str(e))
