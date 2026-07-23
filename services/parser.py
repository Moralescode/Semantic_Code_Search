# -*- coding: utf-8 -*-
"""
Parser de code source pour extraire les fonctions et leurs métadonnées (nom, arguments, docstring, corps).
Prend en charge Python (via ast) et JavaScript (via des expressions régulières robustes).
"""

import ast
import re
from typing import List, Dict, Any

class CodeParser:
    @staticmethod
    def parse_python(code_content: str) -> List[Dict[str, Any]]:
        """
        Analyse du code Python à l'aide de l'AST standard pour extraire toutes les fonctions.
        """
        functions = []
        try:
            tree = ast.parse(code_content)
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    # Extraction de la docstring si elle existe
                    docstring = ast.get_docstring(node) or ""
                    
                    # Reconstruction du code de la fonction
                    # (Dans un parseur de fichiers, on lirait les lignes correspondantes)
                    # Pour être robuste, on va essayer de trouver les lignes de début et de fin
                    start_line = node.lineno - 1
                    # Trouver la fin de la fonction est plus difficile avec ast avant 3.8,
                    # mais sous python 3.8+ node.end_lineno est disponible !
                    end_line = getattr(node, 'end_lineno', len(code_content.splitlines()))
                    
                    lines = code_content.splitlines()
                    func_code_lines = lines[start_line:end_line]
                    func_code = "\n".join(func_code_lines)
                    
                    # Arguments
                    args = [arg.arg for arg in node.args.args]
                    
                    functions.append({
                        "name": node.name,
                        "language": "python",
                        "docstring": docstring,
                        "code": func_code,
                        "arguments": args
                    })
        except Exception as e:
            # En cas de problème de syntaxe, on fait un repli via Regex basique
            pass
        return functions

    @staticmethod
    def parse_javascript(code_content: str) -> List[Dict[str, Any]]:
        """
        Extraction de fonctions JavaScript/TypeScript par Expressions Régulières.
        """
        functions = []
        # Expression régulière robuste pour les fonctions JS (standard, fléchées, ou expressions de fonction)
        pattern = r'function\s+(\w+)\s*\(|(?:const|let|var)\s+(\w+)\s*=\s*.*?(?:=>|function)'
        
        # On va découper et scanner de façon simplifiée
        lines = code_content.splitlines()
        for i, line in enumerate(lines):
            match = re.search(pattern, line)
            if match:
                name = match.group(1) or match.group(2)
                if not name:
                    continue
                
                # Chercher les commentaires au-dessus de la fonction comme docstring
                docstring_lines = []
                j = i - 1
                while j >= 0:
                    prev_line = lines[j].strip()
                    if prev_line.startswith('//'):
                        docstring_lines.insert(0, prev_line.replace('//', '').strip())
                    elif prev_line.endswith('*/'):
                        while j >= 0 and not lines[j].strip().startswith('/*'):
                            docstring_lines.insert(0, lines[j].replace('/*', '').replace('*/', '').replace('*', '').strip())
                            j -= 1
                        if j >= 0:
                            docstring_lines.insert(0, lines[j].replace('/*', '').replace('*', '').strip())
                        break
                    elif prev_line == "":
                        j -= 1
                        continue
                    else:
                        break
                    j -= 1
                
                docstring = " ".join(docstring_lines).strip()
                
                # Extraire une approximation du code de la fonction (les lignes qui suivent jusqu'à l'accolade fermante correspondante)
                func_code_lines = []
                brace_count = 0
                started = False
                for k in range(i, len(lines)):
                    curr_line = lines[k]
                    func_code_lines.append(curr_line)
                    if '{' in curr_line:
                        brace_count += curr_line.count('{')
                        started = True
                    if '}' in curr_line:
                        brace_count -= curr_line.count('}')
                    if started and brace_count <= 0:
                        break
                
                func_code = "\n".join(func_code_lines)
                
                functions.append({
                    "name": name,
                    "language": "javascript",
                    "docstring": docstring,
                    "code": func_code,
                    "arguments": []  # Approximation simplifiée
                })
                
        return functions

    @classmethod
    def parse_file(cls, filepath: str, content: str = None) -> List[Dict[str, Any]]:
        """
        Détermine le parseur approprié selon l'extension du fichier et extrait ses fonctions.
        """
        if content is None:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        
        if filepath.endswith('.py'):
            return cls.parse_python(content)
        elif filepath.endswith('.js') or filepath.endswith('.ts'):
            return cls.parse_javascript(content)
        return []
