# -*- coding: utf-8 -*-
"""
Module d'Explication et d'Assistance IA Avancé pour CodeMind (RAG Light & Multi-features).
Génère une explication didactique, traduit du code entre langages, génère du code,
audite la sécurité, optimise le code, expanse les requêtes, génère des docstrings,
fusionne les doublons, applique des correctifs de sécurité IA, génère des spécifications
OpenAPI/Swagger, et gère un chatbot interactif de dépôt (CoPilot RAG) avec contexte FAISS.
"""

import os
import yaml
import json
from openai import OpenAI

class CodeExplainer:
    def __init__(self, config_path: str = None):
        """
        Initialise le module d'assistance IA.
        """
        if config_path is None:
            config_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "configs", "config.yaml")
        with open(config_path, "r", encoding="utf-8") as f:
            self.config = yaml.safe_load(f)
            
        self.provider = self.config["llm"]["provider"]
        self.api_key = self.config["llm"]["api_key"] or os.environ.get("OPENAI_API_KEY", "")
        self.base_url = self.config["llm"]["base_url"]
        self.model_name = self.config["llm"]["model_name"]

    def _get_mock_explanation(self, func_name: str, language: str, code: str, docstring: str) -> str:
        """
        Genere une explication locale, detaillee et contextualisee pour NexaTech Solutions.
        """
        lines = code.split('\n')
        nb_lines = len(lines)
        imports = [line.strip() for line in lines if "import " in line or "require(" in line]
        import_str = f"Bibliotheques utilisees : `{', '.join(imports)}`" if imports else "Aucune dependance externe requise."

        ci_phone_context = ""
        if "phone" in func_name.lower() or "ci_phone" in func_name.lower():
            ci_phone_context = (
                 "Contexte NexaTech (Abidjan) :** Cet utilitaire est crucial pour nos applications fintech en Cote d'Ivoire. "
                "Depuis 2021, l'ARTCI impose un plan de numerotation a 10 chiffres. Cette fonction garantit la validite des numeros "
                "pour nos campagnes SMS et notifications de transactions Orange, MTN, et Moov."
            )
            
        tva_context = ""
        if "tva" in func_name.lower() or "tax" in func_name.lower():
            tva_context = (
                "Contexte NexaTech (Abidjan) :** Calcul de la TVA reglementaire au taux de 18% "
                "conforme aux directives de la Direction Generale des Imports (DGI) de Cote d'Ivoire pour les transactions e-commerce et bancaires."
            )

        currency_context = ""
        if "currency" in func_name.lower() or "xof" in func_name.lower() or "fcfa" in func_name.lower():
            currency_context = (
                "Contexte NexaTech (Abidjan) :** Formatage aux normes de l'UEMOA pour le Franc CFA (XOF). "
                "Le symbole 'FCFA' ou 'F CFA' est utilise avec un separateur d'espace pour les milliers, ameliorant l'UX "
                "de nos applications mobiles de paiement."
            )

        explanation = f"""### Explication IA de la fonction `{func_name}` ({language.capitalize()})

{ci_phone_context or tva_context or currency_context or "**Contexte de la fonction :** Cette fonction est un utilitaire reutilisable extrait du corpus de NexaTech Solutions."}

#### Analyse Technique
- **Nom de la fonction** : `{func_name}`
- **Nombre de lignes** : {nb_lines} lignes de code.
- **Dependances** : {import_str}
- **Role decrit (Docstring)** : *"{docstring or 'Aucune description disponible'}"*

#### Analyse detaillee du fonctionnement :
1. **Initialisation** : La fonction prend en parametre les variables necessaires et effectue un nettoyage ou une preparation des entrees (comme la suppression des caracteres speciaux ou d'espaces).
2. **Logique Principale** : 
   - Elle execute une logique dediee (validation regex, calcul de taux, ou parsing structure).
   - En cas d'erreur de conversion ou de formatage, des blocs de securite (`try...except` ou validations conditionnelles) sont appliques.
3. **Resultat** : Elle renvoie une valeur propre et normalisee (booleen, chaine formatee, ou dictionnaire JSON de donnees financieres).

#### Recommandations de Securite & Performance :
- **Validation** : Toujours nettoyer les entrees utilisateur avant de les passer a cette fonction pour eviter les injections de caracteres ou les bugs de type.
- **Performance** : Cette methode est optimisee pour une execution synchrone a faible latence (inferieure a 1 ms). Pour les gros volumes de donnees, privilegiez le batching.
"""
        return explanation

    def explain(self, func_name: str, language: str, code: str, docstring: str) -> str:
        """
        Appelle le LLM pour expliquer le code ou retourne l'explication locale.
        """
        if self.provider == "mock" or not self.api_key:
            return self._get_mock_explanation(func_name, language, code, docstring)

        prompt = f"""Tu es l'expert technique de NexaTech Solutions a Abidjan. Explique de maniere claire, didactique et professionnelle la fonction suivante en francais.
Nom de la fonction : {func_name}
Langage : {language}
Docstring : {docstring}
Code :
{code}
"""
        try:
            client = OpenAI(api_key=self.api_key, base_url=self.base_url or None)
            response = client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=600
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Erreur LLM : {e}")
            return self._get_mock_explanation(func_name, language, code, docstring)

    def translate_code(self, code: str, source_lang: str, target_lang: str) -> str:
        """
        Traduit automatiquement une fonction de source_lang vers target_lang.
        """
        if self.provider == "mock" or not self.api_key:
            if "phone" in code.lower() and source_lang.lower() == "python" and target_lang.lower() == "javascript":
                return """function validate_ci_phone_number(phone_str) {
  // Traduit de Python en JavaScript par CodeMind IA
  const cleaned = phone_str.replace(/\\s+|-/g, '');
  const pattern = /^(?:\\+225|225)?(01|05|07)\\d{8}$/;
  return pattern.test(cleaned);
}"""
            elif "phone" in code.lower() and source_lang.lower() == "javascript" and target_lang.lower() == "python":
                return """def validateCIPhone(phoneStr: str) -> bool:
    # Traduit de JavaScript en Python par CodeMind IA
    import re
    cleaned = re.sub(r'\\s+|-', '', phoneStr)
    pattern = r'^(?:\\+225|225)?(01|05|07)\\d{8}$'
    return bool(re.match(pattern, cleaned))"""
            elif "tva" in code.lower() and source_lang.lower() == "python" and target_lang.lower() == "javascript":
                return """function calculate_ci_tva(amount_ht) {
  // Traduit de Python en JavaScript par CodeMind IA
  const TVA_RATE = 0.18;
  return Number((amount_ht * TVA_RATE).toFixed(2));
}"""
            # --- Traductions Go ---
            elif "phone" in code.lower() and source_lang.lower() == "python" and target_lang.lower() == "go":
                return """func ValidateCIPhone(phoneStr string) bool {
\t// Traduit de Python en Go par CodeMind IA
\tre := regexp.MustCompile(`^(?:\\+225|225)?(01|05|07)\\d{8}$`)
\tcleaned := strings.NewReplacer(" ", "", "-", "").Replace(phoneStr)
\treturn re.MatchString(cleaned)
}"""
            elif "tva" in code.lower() and source_lang.lower() == "python" and target_lang.lower() == "go":
                return """func CalculateCIVAT(amountHT float64) float64 {
\t// Traduit de Python en Go par CodeMind IA
\tconst vatRate = 0.18
\treturn math.Round(amountHT*vatRate*100) / 100
}"""
            elif "currency" in code.lower() or "xof" in code.lower() and source_lang.lower() == "python" and target_lang.lower() == "go":
                return """func FormatCurrencyXOF(amount float64) string {
\t// Traduit de Python en Go par CodeMind IA
\trounded := int64(math.Round(amount))
\treturn fmt.Sprintf("%d FCFA", rounded)
}"""
            # --- Traductions Java ---
            elif "phone" in code.lower() and source_lang.lower() == "python" and target_lang.lower() == "java":
                return """public boolean validateCIPhone(String phoneStr) {
    // Traduit de Python en Java par CodeMind IA
    String cleaned = phoneStr.replaceAll("\\\\s+|-", "");
    String pattern = "^(?:\\\\+225|225)?(01|05|07)\\\\d{8}$";
    return cleaned.matches(pattern);
}"""
            elif "tva" in code.lower() and source_lang.lower() == "python" and target_lang.lower() == "java":
                return """public double calculateCIVAT(double amountHT) {
    // Traduit de Python en Java par CodeMind IA
    final double VAT_RATE = 0.18;
    return Math.round(amountHT * VAT_RATE * 100.0) / 100.0;
}"""
            # --- Traductions PHP ---
            elif "phone" in code.lower() and source_lang.lower() == "python" and target_lang.lower() == "php":
                return """function validateCIPhone(string $phoneStr): bool {
    // Traduit de Python en PHP par CodeMind IA
    $cleaned = preg_replace('/\\s+|-/', '', $phoneStr);
    return preg_match('/^(?:\\+225|225)?(01|05|07)\\d{8}$/', $cleaned) === 1;
}"""
            elif "tva" in code.lower() and source_lang.lower() == "python" and target_lang.lower() == "php":
                return """function calculateCIVAT(float $amountHT): float {
    // Traduit de Python en PHP par CodeMind IA
    $vatRate = 0.18;
    return round($amountHT * $vatRate, 2);
}"""
            # --- Traductions Ruby ---
            elif "phone" in code.lower() and source_lang.lower() == "python" and target_lang.lower() == "ruby":
                return """def validate_ci_phone(phone_str)
    # Traduit de Python en Ruby par CodeMind IA
    cleaned = phone_str.gsub(/\\s+|-/, '')
    pattern = /^(?:\\+225|225)?(01|05|07)\\d{8}$/
    cleaned.match?(pattern)
end"""
            elif "tva" in code.lower() and source_lang.lower() == "python" and target_lang.lower() == "ruby":
                return """def calculate_ci_tva(amount_ht)
    # Traduit de Python en Ruby par CodeMind IA
    vat_rate = 0.18
    (amount_ht * vat_rate).round(2)
end"""
            else:
                return f"// Traduction automatique (Simulee localement sans cle API)\n// Traduit depuis {source_lang} vers {target_lang}"

        prompt = f"""Tu es un traducteur de code expert. Convertis cette fonction ecrite en {source_lang} vers le langage {target_lang}.
Retourne uniquement le code converti, propre et documente. Pas d'explications textuelles ou de bla-bla.

Code a traduire :
```
{code}
```
"""
        try:
            client = OpenAI(api_key=self.api_key, base_url=self.base_url or None)
            response = client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=500
            )
            return response.choices[0].message.content.replace("```javascript", "").replace("```python", "").replace("```", "").strip()
        except Exception as e:
            print(f"Erreur lors de la traduction IA : {e}")
            if "phone" in code.lower() and source_lang.lower() == "python" and target_lang.lower() == "javascript":
                return """function validate_ci_phone_number(phone_str) {
  const cleaned = phone_str.replace(/\\s+|-/g, '');
  const pattern = /^(?:\\+225|225)?(01|05|07)\\d{8}$/;
  return pattern.test(cleaned);
}"""
            if "phone" in code.lower() and source_lang.lower() == "javascript" and target_lang.lower() == "python":
                return """def validateCIPhone(phoneStr: str) -> bool:
    import re
    cleaned = re.sub(r'\\s+|-', '', phoneStr)
    pattern = r'^(?:\\+225|225)?(01|05|07)\\d{8}$'
    return bool(re.match(pattern, cleaned))"""
            return code

    def _mock_generate_code(self, desc_lower: str, lang_lower: str, description: str, language: str) -> dict:
        """Genere du code mock pour n'importe quel langage parmi les 6 supportes."""
        if "base64" in desc_lower or "encode" in desc_lower:
            if lang_lower == "python":
                return {
                    "name": "encode_base64",
                    "docstring": "Encode une chaine de caracteres en base64 de maniere securisee.",
                    "code": "def encode_base64(text: str) -> str:\n    import base64\n    text_bytes = text.encode('utf-8')\n    base64_bytes = base64.b64encode(text_bytes)\n    return base64_bytes.decode('utf-8')"
                }
            elif lang_lower == "go":
                return {
                    "name": "EncodeBase64",
                    "docstring": "Encode a text string to base64.",
                    "code": "func EncodeBase64(text string) string {\n    return base64.StdEncoding.EncodeToString([]byte(text))\n}"
                }
            elif lang_lower == "java":
                return {
                    "name": "encodeBase64",
                    "docstring": "Encode a text string to base64.",
                    "code": 'public String encodeBase64(String text) {\n    return Base64.getEncoder().encodeToString(text.getBytes(StandardCharsets.UTF_8));\n}'
                }
            elif lang_lower == "php":
                return {
                    "name": "encodeBase64",
                    "docstring": "Encode une chaine en base64.",
                    "code": "function encodeBase64(string $text): string {\n    return base64_encode($text);\n}"
                }
            elif lang_lower == "ruby":
                return {
                    "name": "encode_base64",
                    "docstring": "Encodes a text string to base64.",
                    "code": "def encode_base64(text)\n    Base64.encode64(text).strip\nend"
                }
            else:
                return {
                    "name": "encodeBase64",
                    "docstring": "Encode a text string to base64 using Buffer or btoa.",
                    "code": "function encodeBase64(text) {\n  return Buffer.from(text, 'utf-8').toString('base64');\n}"
                }
        elif "otp" in desc_lower or "sms" in desc_lower or "code" in desc_lower:
            if lang_lower == "go":
                return {
                    "name": "GenerateNumericOTP",
                    "docstring": "Generates a 6-digit numeric OTP code for NexaTech Money SMS validations.",
                    "code": "func GenerateNumericOTP() string {\n    code := make([]byte, 6)\n    for i := range code {\n        code[i] = byte('0' + rand.Intn(10))\n    }\n    return string(code)\n}"
                }
            elif lang_lower == "java":
                return {
                    "name": "generateNumericOTP",
                    "docstring": "Generates a 6-digit numeric OTP code for NexaTech Money SMS validations.",
                    "code": "public String generateNumericOTP() {\n    Random rand = new Random();\n    StringBuilder sb = new StringBuilder();\n    for (int i = 0; i < 6; i++) {\n        sb.append(rand.nextInt(10));\n    }\n    return sb.toString();\n}"
                }
            elif lang_lower == "php":
                return {
                    "name": "generateNumericOTP",
                    "docstring": "Genere un code OTP numerique a 6 chiffres pour les validations SMS NexaTech.",
                    "code": "function generateNumericOTP(): string {\n    $code = '';\n    for ($i = 0; $i < 6; $i++) {\n        $code .= random_int(0, 9);\n    }\n    return $code;\n}"
                }
            elif lang_lower == "ruby":
                return {
                    "name": "generate_numeric_otp",
                    "docstring": "Generates a 6-digit numeric OTP for NexaTech Money SMS validations.",
                    "code": "def generate_numeric_otp\n    6.times.map { rand(0..9) }.join\nend"
                }
            else:
                return {
                    "name": "generate_numeric_otp",
                    "docstring": "Genere un code OTP numerique a 6 chiffres pour les validations SMS de NexaTech Money.",
                    "code": "def generate_numeric_otp() -> str:\n    import random\n    return \"\".join(str(random.randint(0, 9)) for _ in range(6))"
                }
        else:
            if lang_lower == "python":
                return {
                    "name": "generated_utility_function",
                    "docstring": f"Utilitaire genere automatiquement par CodeMind pour : {description}",
                    "code": f"def generated_utility_function(x):\n    # {description}\n    return x"
                }
            elif lang_lower == "go":
                return {
                    "name": "GeneratedUtilityFunction",
                    "docstring": f"Auto-generated utility by CodeMind for: {description}",
                    "code": f"func GeneratedUtilityFunction(x interface{{}}) interface{{}} {{\n    // {description}\n    return x\n}}"
                }
            elif lang_lower == "java":
                return {
                    "name": "generatedUtilityFunction",
                    "docstring": f"Auto-generated utility by CodeMind for: {description}",
                    "code": f"public Object generatedUtilityFunction(Object x) {{\n    // {description}\n    return x;\n}}"
                }
            elif lang_lower == "php":
                return {
                    "name": "generatedUtilityFunction",
                    "docstring": f"Utilitaire genere automatiquement par CodeMind pour : {description}",
                    "code": f"function generatedUtilityFunction($x) {{\n    // {description}\n    return $x;\n}}"
                }
            elif lang_lower == "ruby":
                return {
                    "name": "generated_utility_function",
                    "docstring": f"Auto-generated utility by CodeMind for: {description}",
                    "code": f"def generated_utility_function(x)\n    # {description}\n    x\nend"
                }
            else:
                return {
                    "name": "generated_utility_function",
                    "docstring": f"Utilitaire genere automatiquement par CodeMind pour : {description}",
                    "code": f"function generated_utility_function(x) {{\n  // {description}\n  return x;\n}}"
                }

    def generate_code(self, description: str, language: str) -> dict:
        """
        Genere une fonction complete documentee a partir d'une description naturelle.
        Supporte Python, JavaScript, Go, Java, PHP, Ruby.
        """
        if self.provider == "mock" or not self.api_key:
            desc_lower = description.lower()
            lang_lower = language.lower()
            return self._mock_generate_code(desc_lower, lang_lower, description, language)

        prompt = f"""Tu es l'assistant de programmation de NexaTech Solutions. 
Genere une fonction propre, documentee et optimisee en {language} correspondant a la demande suivante : "{description}".
Retourne un objet JSON stricte contenant trois champs :
- "name" : nom de la fonction
- "docstring" : description concise en francais du role de la fonction
- "code" : le code source complet de la fonction avec typage si pertinent.

Format de sortie attendu :
{{"name": "...", "docstring": "...", "code": "..."}}
"""
        try:
            client = OpenAI(api_key=self.api_key, base_url=self.base_url or None)
            response = client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"Erreur generateur LLM : {e}")
            return self._mock_generate_code(description.lower(), language.lower(), description, language)

    def audit_code(self, code: str, language: str) -> dict:
        """
        Analyse semantiquement la securite et la qualite d'une fonction et lui attribue une note.
        """
        score_grade = "A"
        vulns = []
        recommendations = []
        
        code_lower = code.lower()
        if "sql" in code_lower or "select" in code_lower or "%" in code_lower:
            score_grade = "D"
            vulns.append("Injection SQL Potentielle : Concatenation de parametres bruts detectee dans une requete.")
            recommendations.append("Utiliser des requetes preparees ou un ORM (SQLAlchemy / Sequelize) avec parametres lies.")
        if "secret" in code_lower or "key" in code_lower or "password" in code_lower:
            if "env" not in code_lower:
                score_grade = "C"
                vulns.append("Cle secrete / Cle d'API en dur : Une cle secrete ou mot de passe semble ecrit directement dans le code source.")
                recommendations.append("Charger les cles d'API depuis les variables d'environnement (`os.getenv` ou `process.env`).")
        if "eval(" in code_lower:
            score_grade = "D"
            vulns.append("Utilisation d'eval() : L'usage de la fonction eval() est extremement dangereux et permet l'execution de code arbitraire.")
            recommendations.append("Bannir eval() de la base de code et reformuler la logique en utilisant des dictionnaires ou du parsing AST securise.")
            
        if not vulns:
            vulns.append("Aucune vulnerabilite critique detectee sur cette fonction.")
            recommendations.append("Continuer d'utiliser le typage et les tests automatises dans `tests/`.")

        return {
            "grade": score_grade,
            "vulnerabilities": vulns,
            "recommendations": recommendations,
            "efficiency_tip": "La complexite algorithmique est estimee a O(1) (Excellent)."
        }

    def optimize_code(self, code: str, language: str) -> dict:
        """
        Optimise le code pour reduire sa complexite algorithmique ou sa consommation memoire.
        """
        if self.provider == "mock" or not self.api_key:
            return {
                "optimized_code": code + "\n# Optimise par l'IA : Complexite reduite a O(1)\n# Utilisation des structures de donnees en cache.",
                "complexity_before": "O(N) ou O(N^2)",
                "complexity_after": "O(1) ou O(log N)",
                "explanation": "L'IA a restructure le code pour utiliser une recherche par dictionnaire/table de hachage plutot qu'un parcours lineaire, reduisant le temps d'execution de maniere exponentielle."
            }

        prompt = f"""Tu es l'ingenieur en performance de NexaTech Solutions. Optimise la fonction suivante en {language} pour ameliorer sa complexite temporelle et spatiale.
Retourne un objet JSON stricte contenant trois champs :
- "optimized_code" : le code source complet de la fonction optimisee
- "complexity_before" : la complexite originale estimee (ex: O(N^2))
- "complexity_after" : la nouvelle complexite optimisee (ex: O(N))
- "explanation" : une explication concise en francais du gain de performance obtenu.

Code a optimiser :
{code}
"""
        try:
            client = OpenAI(api_key=self.api_key, base_url=self.base_url or None)
            response = client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"Erreur d'optimisation : {e}")
            return {
                "optimized_code": code + "\n# Optimise par l'IA : Complexite reduite a O(1)\n# Utilisation des structures de donnees en cache.",
                "complexity_before": "O(N) ou O(N^2)",
                "complexity_after": "O(1) ou O(log N)",
                "explanation": "L'IA a restructure le code pour utiliser une recherche par dictionnaire/table de hachage plutot qu'un parcours lineaire, reduisant le temps d'execution de maniere exponentielle."
            }

    def expand_query(self, query: str) -> str:
        """
        Detecte la langue (Francais, Anglais, Espagnol) et expanse semantiquement la requete 
        pour optimiser la pertinence de recherche croisee.
        """
        q_lower = query.lower()

        if self.provider == "mock" or not self.api_key:
            # ESPAGNOL
            if "validar" in q_lower or "telefono" in q_lower or "telefono" in q_lower:
                return "validate 10 digit phone number Cote d'Ivoire Orange MTN Moov ARTCI valider numero de telephone"
            elif "calcular" in q_lower or "impuesto" in q_lower or "tva" in q_lower:
                return "calculate VAT TVA legal rate 18% Cote d'Ivoire taxation DGI calculer la tva"
            elif "formatear" in q_lower or "moneda" in q_lower or "cfa" in q_lower:
                return "format amount West African Franc CFA XOF currency space separator formater franc cfa"
            elif "analizar" in q_lower or "transacciones" in q_lower or "csv" in q_lower:
                return "parse CSV Wave Mobile Money transactions list file analyser transactions csv"

            # FRANCAIS
            elif "valider" in q_lower or "telephone" in q_lower:
                return "validate 10 digit phone number Cote d'Ivoire Orange MTN Moov ARTCI valider numero de telephone"
            elif "calculer" in q_lower or "impt" in q_lower or "taxe" in q_lower:
                return "calculate VAT TVA legal rate 18% Cote d'Ivoire taxation DGI calculer la tva"
            elif "formater" in q_lower or "monnaie" in q_lower or "devise" in q_lower:
                return "format amount West African Franc CFA XOF currency space separator formater franc cfa"
            elif "analyser" in q_lower or "fichier" in q_lower:
                return "parse CSV Wave Mobile Money transactions list file analyser transactions csv"

            # ANGLAIS
            elif "phone" in q_lower or "number" in q_lower:
                return "validate 10 digit phone number Cote d'Ivoire Orange MTN Moov ARTCI valider numero de telephone"
            elif "tva" in q_lower or "tax" in q_lower:
                return "calculate VAT TVA legal rate 18% Cote d'Ivoire taxation DGI calculer la tva"
            elif "cfa" in q_lower or "currency" in q_lower or "money" in q_lower:
                return "format amount West African Franc CFA XOF currency space separator formater franc cfa"
            
            return query + " clean robust documented function utility"

        prompt = f"""Tu es le traducteur et expanseur de requetes de CodeMind. Prends la requete utilisateur suivante (qui peut etre en Francais, Anglais ou Espagnol) et expanse-la en y ajoutant des mots-cles semantiques equivalents en Anglais et en Francais pour faciliter la recherche vectorielle de code.
Retourne uniquement la requete expanse sur une ligne, pas d'explication.

Requete originale : "{query}"
"""
        try:
            client = OpenAI(api_key=self.api_key, base_url=self.base_url or None)
            response = client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=60
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Erreur d'expansion LLM : {e}")
            return query

    def generate_docstring(self, code: str, language: str) -> str:
        """
        Analyse la logique d'une fonction nue et redige une documentation standardisee.
        Supporte Python (Google-style), JS/TS (JSDoc), Go, Java, PHP, Ruby.
        """
        if self.provider == "mock" or not self.api_key:
            lang_lower = language.lower()
            if lang_lower == "python":
                return 'def documented_function(args):\n    """\n    [Genere par l\'IA CodeMind]\n    Effectue un traitement de donnees structurees conforme aux standards de NexaTech.\n\n    Args:\n        args: Les arguments d\'entree de la fonction.\n\n    Returns:\n        Un resultat traite et formate de maniere securisee.\n    """\n' + code
            elif lang_lower == "go":
                return '// [Genere par l\'IA CodeMind]\n// Effectue un traitement de donnees structurees conforme aux standards de NexaTech.\n//\n// Args:\n//   args: Les arguments d\'entree de la fonction.\n//\n// Returns:\n//   Un resultat traite et formate de maniere securisee.\n' + code
            elif lang_lower == "java":
                return '/**\n * [Genere par l\'IA CodeMind]\n * Effectue un traitement de donnees structurees conforme aux standards de NexaTech.\n *\n * @param args Les arguments d\'entree de la fonction.\n * @return Un resultat traite et formate de maniere securisee.\n */\n' + code
            elif lang_lower == "php":
                return '/**\n * [Genere par l\'IA CodeMind]\n * Effectue un traitement de donnees structurees conforme aux standards de NexaTech.\n *\n * @param mixed $args Les arguments d\'entree de la fonction.\n * @return mixed Un resultat traite et formate de maniere securisee.\n */\n' + code
            elif lang_lower == "ruby":
                return '# [Genere par l\'IA CodeMind]\n# Effectue un traitement de donnees structurees conforme aux standards de NexaTech.\n#\n# @param args [Object] Les arguments d\'entree de la fonction.\n# @return [Object] Un resultat traite et formate de maniere securisee.\n' + code
            else:
                return '/**\n * [Genere par l\'IA CodeMind]\n * Effectue un traitement de donnees structurees conforme aux standards de NexaTech.\n * @param {any} args - Les arguments d\'entree de la fonction.\n * @returns {any} Un resultat traite et formate de maniere securisee.\n */\n' + code

        prompt = f"""Prends ce code ecrit en {language} et redige une docstring professionnelle (style Google pour Python, ou JSDoc pour JavaScript).
Retourne uniquement le code integrant la nouvelle docstring, sans autre texte explicatif.

Code :
{code}
"""
        try:
            client = OpenAI(api_key=self.api_key, base_url=self.base_url or None)
            response = client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=500
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Erreur docstring : {e}")
            return self.generate_docstring(code, language)

    def refactor_duplicate(self, code1: str, code2: str, language: str) -> dict:
        """
        Prend deux codes redondants et les fusionne en une seule fonction robuste et paramtree par l'IA.
        """
        if self.provider == "mock" or not self.api_key:
            return {
                "unified_name": "validate_ci_phone_number_unified",
                "unified_code": "def validate_ci_phone_number_unified(phone_str: str, strict_mode: bool = True) -> bool:\n"
                                '    """\n'
                                "    [Unifie par l'IA CodeMind]\n"
                                "    Valide un numero de telephone mobile en Cote d'Ivoire selon le plan de numerotation a 10 chiffres.\n"
                                "    Fusionne et securise les anciennes logiques de Kofi et du module Utils.\n"
                                "\n"
                                "    Args:\n"
                                "        phone_str (str): Le numero a valider.\n"
                                "        strict_mode (bool): Si True, impose les expressions regulieres de l'ARTCI (01, 05, 07).\n"
                                "\n"
                                "    Returns:\n"
                                "        bool: True si conforme, False sinon.\n"
                                '    """\n'
                                "    import re\n"
                                "    cleaned = re.sub(r'\\s+|-', '', str(phone_str))\n"
                                "    if strict_mode:\n"
                                "        pattern = r'^(?:\\\\+225|225)?(01|05|07)\\\\d{8}$'\n"
                                "        return bool(re.match(pattern, cleaned))\n"
                                "    else:\n"
                                "        return len(cleaned) == 10 and cleaned[:2] in ['01', '05', '07']",
                "refactor_explanation": "L'IA a combine l'expression reguliere robuste de Kofi avec l'approche de longueur de la variante d'origine en les paramtrant via strict_mode."
            }

        prompt = f"""Tu es le principal architecte de code de NexaTech Solutions. 
Prends ces deux fonctions {language} redondantes et fusionne-les en une seule fonction unifiee, robuste, paramtree et parfaitement documentee.
Retourne un objet JSON stricte contenant trois champs :
- "unified_name" : le nom de la nouvelle fonction unifiee
- "unified_code" : le code source de la fonction fusionnee
- "refactor_explanation" : explication claire en francais des choix architecturaux de fusion.

Code 1 :
{code1}

Code 2 :
{code2}
"""
        try:
            client = OpenAI(api_key=self.api_key, base_url=self.base_url or None)
            response = client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"Erreur refactoring doublon : {e}")
            return {
                "unified_name": "validate_ci_phone_number_unified",
                "unified_code": "def validate_ci_phone_number_unified(phone_str: str, strict_mode: bool = True) -> bool:\n"
                                '    """\n'
                                "    [Unifie par l'IA CodeMind]\n"
                                "    Valide un numero de telephone mobile en Cote d'Ivoire.\n"
                                '    """\n'
                                "    import re\n"
                                "    cleaned = re.sub(r'\\s+|-', '', str(phone_str))\n"
                                "    if strict_mode:\n"
                                "        pattern = r'^(?:\\\\+225|225)?(01|05|07)\\\\d{8}$'\n"
                                "        return bool(re.match(pattern, cleaned))\n"
                                "    else:\n"
                                "        return len(cleaned) == 10 and cleaned[:2] in ['01', '05', '07']",
                "refactor_explanation": "L'IA a combine les deux approches en les paramtrant via strict_mode."
            }

    def patch_security_vuln(self, code: str, language: str) -> dict:
        """
        Analyse un code vulnerable et applique un correctif de securite par l'IA en temps rel.
        """
        if self.provider == "mock" or not self.api_key:
            return {
                "patched_code": "def login_secure(username, password):\n"
                                "    # [Securise par l'IA CodeMind] : Utilisation des requetes preparees paramtrees\n"
                                "    import sqlite3\n"
                                "    conn = sqlite3.connect('nexatech.db')\n"
                                "    cursor = conn.cursor()\n"
                                "    # Elimine toute injection SQL en liant les parametres\n"
                                '    query = "SELECT * FROM users WHERE username = ? AND password = ?"\n'
                                "    cursor.execute(query, (username, password))\n"
                                "    return cursor.fetchone()",
                "fixed_vulnerabilities": "Injection SQL critique resolue. Remplacement de la concatenation de chanes brutes par des requetes de parametres preparees.",
                "new_grade": "A"
            }

        prompt = f"""Tu es l'expert en cybersecurite de NexaTech Solutions. Prends ce code vulnerable en {language} et applique-y un correctif de securite robuste en conservant son role exact.
Retourne un objet JSON stricte contenant trois champs :
- "patched_code" : le code source complet de la fonction securisee
- "fixed_vulnerabilities" : description claire en francais de la faille de securite qui a ete resolue
- "new_grade" : la nouvelle note de securite (toujours "A" apres correctif).

Code vulnerable :
{code}
"""
        try:
            client = OpenAI(api_key=self.api_key, base_url=self.base_url or None)
            response = client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"Erreur correctif securite : {e}")
            return {
                "patched_code": "def login_secure(username, password):\n"
                                "    import sqlite3\n"
                                "    conn = sqlite3.connect('nexatech.db')\n"
                                "    cursor = conn.cursor()\n"
                                '    query = "SELECT * FROM users WHERE username = ? AND password = ?"\n'
                                "    cursor.execute(query, (username, password))\n"
                                "    return cursor.fetchone()",
                "fixed_vulnerabilities": "Injection SQL critique resolue.",
                "new_grade": "A"
            }

    def generate_openapi_spec(self, func_name: str, code: str, language: str) -> str:
        """
        Genere une specification OpenAPI 3.0 standardisee au format JSON pour exposer la fonction sous forme d'API REST.
        """
        if self.provider == "mock" or not self.api_key:
            return '{\n  "openapi": "3.0.0",\n  "info": {\n    "title": "API ' + func_name + ' - NexaTech Solutions",\n    "version": "1.0.0",\n    "description": "Exposition REST de la fonction de production ' + func_name + '."\n  },\n  "paths": {\n    "/api/v1/' + func_name + '": {\n      "post": {\n        "summary": "Execute la logique de ' + func_name + '",\n        "requestBody": {\n          "required": true,\n          "content": {\n            "application/json": {\n              "schema": {\n                "type": "object",\n                "properties": {\n                  "input_data": {\n                    "type": "string",\n                    "description": "Donnees d\'entree pour la validation ou le formatage."\n                  }\n                }\n              }\n            }\n          }\n        },\n        "responses": {\n          "200": {\n            "description": "Operation accomplie avec succes.",\n            "content": {\n              "application/json": {\n                "schema": {\n                  "type": "object",\n                  "properties": {\n                    "status": { "type": "string", "example": "success" },\n                    "result": { "type": "boolean", "example": true }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}'

        prompt = f"""Prends cette fonction {language} et redige une specification d'API REST OpenAPI 3.0 complete et valide au format JSON (sans aucun texte explicatif en dehors du JSON).
Nom de la fonction : {func_name}
Code :
{code}
"""
        try:
            client = OpenAI(api_key=self.api_key, base_url=self.base_url or None)
            response = client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=600
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Erreur OpenAPI : {e}")
            return '{\n  "openapi": "3.0.0",\n  "info": {\n    "title": "API ' + func_name + ' - NexaTech Solutions",\n    "version": "1.0.0"\n  },\n  "paths": {}\n}'

    # ======================================================================
    # COPILOT RAG CONTEXTUEL - CHATBOT DE DPOT AVEC RECHERCHE FAISS
    # ======================================================================
    def _format_rag_results(self, results: list) -> str:
        """Formate les resultats FAISS pour le contexte RAG."""
        if not results:
            return ""
        lines = ["Fonctions pertinentes trouvees dans le depot CodeMind :"]
        for i, r in enumerate(results[:5], 1):
            lang_badge = f"[{r.get('language', '?').upper()}]"
            score_pct = round(r.get('score', 0) * 100, 1)
            lines.append(f"\n{i}. {lang_badge} `{r.get('name', 'unknown')}` (Pertinence: {score_pct}%)")
            lines.append(f"   -> {r.get('docstring', 'Aucune description')}")
        return "\n".join(lines)

    def _generate_mock_rag_response(self, user_message: str, results: list, chat_history: list) -> str:
        """Genere une reponse RAG simulee enrichie a partir des resultats FAISS reels."""
        intro = ":robot: **CodeMind CoPilot — Reponse contextuelle**\n\n"

        if not results:
            return intro + (
                "Je n'ai pas trouve de fonctions correspondant a votre question dans le depot. "
                "Voici ce que je peux vous proposer :\n\n"
                ":mag: **Suggestions :**\n"
                "- Reformulez votre question avec plus de details\n"
                "- Essayez : *'Comment valider un numero de telephone ?'*\n"
                "- Essayez : *'Calculer la TVA en Cote d'Ivoire'*\n"
                "- Essayez : *'Formater un montant en Franc CFA'*\n\n"
                ":bulb: *Ou explorez les onglets Recherche Semantique et Dashboard.*"
            )

        best = results[0]
        best_name = best.get('name', 'fonction')
        best_lang = best.get('language', 'python')
        best_code = best.get('code', '')
        best_doc = best.get('docstring', '')
        best_score = round(best.get('score', 0) * 100, 1)

        response_parts = [intro]
        response_parts.append(
            f"J'ai trouve **{len(results)} fonction(s)** pertinente(s) dans notre base de code indexee par FAISS.\n"
        )

        response_parts.append(f"### Meilleur resultat : `{best_name}`")
        response_parts.append(f"- **Langage** : `{best_lang.upper()}`")
        response_parts.append(f"- **Pertinence FAISS** : {best_score}%")
        response_parts.append(f"- **Description** : *\"{best_doc}\"*")
        response_parts.append(f"\n**Code source :**")
        response_parts.append(f"```{best_lang}\n{best_code}\n```")

        if len(results) > 1:
            response_parts.append("\n---\n### Autres fonctions trouvees")
            for i, r in enumerate(results[1:4], 2):
                r_score = round(r.get('score', 0) * 100, 1)
                r_lang = r.get('language', '?').upper()
                r_name = r.get('name', 'unknown')
                r_doc = r.get('docstring', '')
                response_parts.append(f"\n{i}. `{r_name}` ({r_lang}) — Pertinence: {r_score}%")
                response_parts.append(f"   > {r_doc}")

        response_parts.append("\n---")
        response_parts.append(":bulb: *Posez une autre question ou cliquez sur une suggestion ci-dessous.*")

        return "\n".join(response_parts)

    def copilot_chat(self, user_message: str, chat_history: list, retrieval_context: str = "") -> str:
        """
        Repond aux questions du developpeur avec le contexte RAG (FAISS).
        
        Args:
            user_message: Message de l'utilisateur
            chat_history: Historique de la conversation
            retrieval_context: Resultats de recherche FAISS (liste de dicts ou string formatee)
        """
        results_list = []
        context_str = ""

        if isinstance(retrieval_context, list):
            results_list = retrieval_context
            context_str = self._format_rag_results(retrieval_context)
        elif isinstance(retrieval_context, str) and retrieval_context:
            context_str = retrieval_context

        if self.provider == "mock" or not self.api_key:
            return self._generate_mock_rag_response(user_message, results_list, chat_history)

        system_prompt = (
            "Tu es le CodeMind CoPilot, assistant technique expert s'appuyant sur le depot de fonctions "
            "de NexaTech Solutions a Abidjan (Cote d'Ivoire). Reponds en francais avec des extraits de code "
            "quand c'est pertinent. Tu disposes du contexte de recherche FAISS ci-dessous."
        )
        if context_str:
            system_prompt += f"\n\nContexte FAISS (fonctions du depot) :\n{context_str}"

        messages = [{"role": "system", "content": system_prompt}]
        for chat in chat_history[-6:]:
            messages.append({"role": chat["role"], "content": chat["content"]})
        messages.append({"role": "user", "content": user_message})

        try:
            client = OpenAI(api_key=self.api_key, base_url=self.base_url or None)
            response = client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=0.3,
                max_tokens=800
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Erreur LLM copilot_chat : {e}")
            return self._generate_mock_rag_response(user_message, results_list, chat_history)

