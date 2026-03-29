/** Garde-fous Copilote : évite payloads énormes et coûts API incontrôlés. */

/** Taille max d’un message utilisateur / assistant (caractères). */
export const ASSISTANT_MAX_MESSAGE_CHARS = 8_000;

/** Nombre max de tours récents envoyés au backend (user+assistant). */
export const ASSISTANT_MAX_TURNS = 24;

/** Rétention max dans le store persistant (évite AsyncStorage surchargé). */
export const ASSISTANT_MAX_STORED_MESSAGES = 120;
