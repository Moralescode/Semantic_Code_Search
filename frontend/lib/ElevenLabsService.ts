'use client';

/**
 * ElevenLabs Text-to-Speech Service — Version améliorée
 * Utilise l'API ElevenLabs pour la synthèse vocale interactive
 * avec file d'attente, sélection de voix et fallback navigateur
 */

// Voix ElevenLabs disponibles
export interface ElevenLabsVoice {
  id: string;
  name: string;
  description: string;
  gender: 'male' | 'female';
  accent?: string;
}

export const AVAILABLE_VOICES: ElevenLabsVoice[] = [
  { id: 'OhWejZm6c7D8CIm5epRM', name: 'Ma Voix', description: 'Voix personnalisée CodeMind', gender: 'female' },
  { id: 'EXAVITQu4vrRV9E3zY0', name: 'Bella', description: 'Voix féminine douce et naturelle', gender: 'female' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Voix féminine claire et professionnelle', gender: 'female' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Voix masculine posée et rassurante', gender: 'male' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Voix masculine dynamique', gender: 'male' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', description: 'Voix féminine jeune et enjouée', gender: 'female' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', description: 'Voix masculine chaleureuse', gender: 'male', accent: 'american' },
];

const DEFAULT_VOICE_ID = 'OhWejZm6c7D8CIm5epRM'; // Ma Voix personnalisée
const API_BASE = 'https://api.elevenlabs.io/v1';

// File d'attente de synthèse vocale
let speakingQueue: string[] = [];
let isSpeakingLock = false;
let currentAudio: HTMLAudioElement | null = null;

type SpeakingStatusListener = (isSpeaking: boolean) => void;
const statusListeners: SpeakingStatusListener[] = [];

function notifyListeners() {
  const status = isSpeakingLock || speakingQueue.length > 0;
  statusListeners.forEach(fn => fn(status));
}

// Récupérer la clé API depuis les variables d'environnement ou localStorage
function getApiKey(): string {
  if (typeof window === 'undefined') return '';
  return process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || 
         localStorage.getItem('elevenlabs_api_key') || 
         '';
}

export function setApiKey(key: string) {
  localStorage.setItem('elevenlabs_api_key', key);
}

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('elevenlabs_api_key') || '';
}

export function getStoredVoiceId(): string {
  if (typeof window === 'undefined') return DEFAULT_VOICE_ID;
  return localStorage.getItem('elevenlabs_voice_id') || DEFAULT_VOICE_ID;
}

export function setStoredVoiceId(voiceId: string) {
  localStorage.setItem('elevenlabs_voice_id', voiceId);
}

export function getAvailableVoices(): ElevenLabsVoice[] {
  return AVAILABLE_VOICES;
}

export function getSpeakingStatus(): boolean {
  return isSpeakingLock || speakingQueue.length > 0 || !!currentAudio;
}

export function onSpeakingStatusChange(listener: SpeakingStatusListener): () => void {
  statusListeners.push(listener);
  return () => {
    const idx = statusListeners.indexOf(listener);
    if (idx >= 0) statusListeners.splice(idx, 1);
  };
}

/**
 * Tester la connexion à l'API ElevenLabs
 */
export async function testElevenLabsConnection(apiKey?: string): Promise<{ success: boolean; message: string }> {
  const key = apiKey || getApiKey();
  if (!key) {
    return { success: false, message: 'Aucune clé API configurée. Veuillez entrer votre clé API ElevenLabs.' };
  }

  try {
    const response = await fetch(`${API_BASE}/voices`, {
      headers: {
        'xi-api-key': key,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { 
        success: true, 
        message: `✅ Connexion réussie ! ${data.voices?.length || 0} voix disponibles.` 
      };
    } else if (response.status === 401) {
      return { success: false, message: '❌ Clé API invalide. Vérifiez votre clé sur elevenlabs.io' };
    } else {
      return { success: false, message: `❌ Erreur API: ${response.status} ${response.statusText}` };
    }
  } catch (error) {
    return { success: false, message: '❌ Impossible de contacter l\'API ElevenLabs. Vérifiez votre connexion internet.' };
  }
}

/**
 * Synthèse vocale d'un texte avec file d'attente
 */
export async function speakText(
  text: string,
  voiceId?: string,
  options?: { priority?: boolean }
): Promise<void> {
  const vId = voiceId || getStoredVoiceId();
  const apiKey = getApiKey();

  // Si pas de clé API, fallback navigateur immédiat
  if (!apiKey) {
    return speakWithBrowser(text);
  }

  // Si priorité, on vide la file et on arrête la lecture en cours
  if (options?.priority) {
    speakingQueue = [];
    cancelSpeakingInternal();
  }

  // Ajouter à la file d'attente
  speakingQueue.push(text);
  notifyListeners();

  // Si déjà en train de parler, on attend
  if (isSpeakingLock) return;

  isSpeakingLock = true;

  while (speakingQueue.length > 0) {
    const currentText = speakingQueue.shift()!;
    notifyListeners();

    try {
      await speakWithElevenLabs(currentText, vId, apiKey);
    } catch (error) {
      console.warn('⚠️ ElevenLabs failed, fallback to browser TTS:', error);
      await speakWithBrowser(currentText);
    }
  }

  isSpeakingLock = false;
  notifyListeners();
}

/**
 * Synthèse vocale via l'API ElevenLabs
 */
async function speakWithElevenLabs(text: string, voiceId: string, apiKey: string): Promise<void> {
  const response = await fetch(`${API_BASE}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.3,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status}`);
  }

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  currentAudio = audio;
  notifyListeners();

  return new Promise((resolve, reject) => {
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
      notifyListeners();
      resolve();
    };
    audio.onerror = (err) => {
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
      notifyListeners();
      reject(err);
    };
    audio.play().catch((err) => {
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
      notifyListeners();
      reject(err);
    });
  });
}

/**
 * Arrêter la synthèse vocale en cours
 */
export function cancelSpeaking() {
  cancelSpeakingInternal();
}

function cancelSpeakingInternal() {
  speakingQueue = [];
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  isSpeakingLock = false;
  notifyListeners();
}

/**
 * Parler les résultats de recherche
 */
export async function speakSearchResults(query: string, count: number, voiceId?: string) {
  const resultText = count === 0
    ? `Aucun résultat trouvé pour "${query}". Essayez de reformuler votre recherche.`
    : count === 1
    ? `Un résultat trouvé pour "${query}".`
    : `${count} résultats trouvés pour "${query}".`;

  await speakText(resultText, voiceId, { priority: true });
}

/**
 * Parler une explication de code
 */
export async function speakExplanation(explanation: string, voiceId?: string) {
  // Nettoyer le texte : enlever les **, les URLs, etc.
  const cleanText = explanation
    .replace(/\*\*/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/#/g, '')
    .replace(/`/g, '')
    .trim();

  // Si le texte est trop long, on lit un résumé
  if (cleanText.length > 2000) {
    const summary = cleanText.substring(0, 2000) + '... (fin de l\'explication)';
    await speakText(summary, voiceId, { priority: true });
  } else {
    await speakText(cleanText, voiceId, { priority: true });
  }
}

/**
 * Parler la réponse du CoPilot
 */
export async function speakCopilotResponse(response: string, voiceId?: string) {
  const cleanText = response
    .replace(/\*\*/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/`/g, '')
    .replace(/#/g, '')
    .replace(/---/g, '')
    .trim();

  if (cleanText.length > 3000) {
    const summary = cleanText.substring(0, 3000) + '... (fin du message)';
    await speakText(summary, voiceId, { priority: true });
  } else {
    await speakText(cleanText, voiceId, { priority: true });
  }
}

/**
 * Fallback: Utiliser l'API Web Speech (synthèse vocale du navigateur)
 */
function speakWithBrowser(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      console.warn('⚠️ Speech synthesis not supported');
      resolve();
      return;
    }

    // Annuler toute synthèse en cours
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    // Essayer de trouver une voix féminine française
    const voices = window.speechSynthesis.getVoices();
    const frenchVoice = voices.find(
      v => v.lang.startsWith('fr') && v.name.toLowerCase().includes('female')
    ) || voices.find(v => v.lang.startsWith('fr'));
    
    if (frenchVoice) {
      utterance.voice = frenchVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (err) => {
      console.warn('Speech synthesis error:', err);
      resolve(); // Ne pas bloquer
    };

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Vérifier si la synthèse vocale est disponible
 */
export function isSpeechSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window || !!getApiKey();
}

/**
 * Arrêter la synthèse vocale (ancien nom, conservé pour compatibilité)
 */
export function stopSpeaking() {
  cancelSpeaking();
}

