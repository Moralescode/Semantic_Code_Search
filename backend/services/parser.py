# -*- coding: utf-8 -*-
"""
Parser de code source pour extraire les fonctions et leurs métadonnées (nom, arguments, docstring, corps).
Prend en charge Python (via ast), JavaScript/TypeScript (via regex), Go, Java, PHP et Ruby.
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
                    docstring = ast.get_docstring(node) or ""
                    start_line = node.lineno - 1
                    end_line = getattr(node, 'end_lineno', len(code_content.splitlines()))
                    lines = code_content.splitlines()
                    func_code_lines = lines[start_line:end_line]
                    func_code = "\n".join(func_code_lines)
                    args = [arg.arg for arg in node.args.args]
                    functions.append({
                        "name": node.name,
                        "language": "python",
                        "docstring": docstring,
                        "code": func_code,
                        "arguments": args
                    })
        except Exception:
            pass
        return functions

    @staticmethod
    def _parse_braces_language(code_content: str, language: str) -> List[Dict[str, Any]]:
        """
        Parse les langages à accolades { } : JavaScript, Go, Java, PHP.
        Utilise des expressions régulières pour détecter les fonctions/méthodes.
        """
        functions = []
        lines = code_content.splitlines()

        # Patterns selon le langage
        if language == "go":
            # Go: func Name(params) (returnTypes) { ... }
            pattern = r'func\s+(\w+)\s*\(([^)]*)\)'
        elif language == "java":
            # Java: public/private/static Type name(params) { ... }
            pattern = r'(?:public|private|protected|static|\s)*\s+(\w+(?:\[\])*(?:<\w+>)?)\s+(\w+)\s*\(([^)]*)\)\s*(?:throws\s+\w+(?:,\s*\w+)*)?\s*\{'
        elif language == "php":
            # PHP: function name(params) { ... }  or  public/private function name(params) { ... }
            pattern = r'(?:public|private|protected|static|\s)*\s*function\s+(\w+)\s*\(([^)]*)\)'
        else:
            # JavaScript (fallback)
            pattern = r'function\s+(\w+)\s*\(|(?:const|let|var)\s+(\w+)\s*=\s*.*?(?:=>|function)'

        for i, line in enumerate(lines):
            match = re.search(pattern, line)
            if match:
                # Extraction du nom
                if language == "java":
                    name = match.group(2) if match.lastindex >= 2 else None
                elif language in ("go", "php"):
                    name = match.group(1)
                else:
                    name = match.group(1) or match.group(2)

                if not name:
                    continue

                # Docstring: commentaires au-dessus
                docstring_lines = []
                j = i - 1
                while j >= 0:
                    prev_line = lines[j].strip()
                    if prev_line.startswith('//'):
                        docstring_lines.insert(0, prev_line.replace('//', '').strip())
                    elif prev_line.startswith('#'):
                        docstring_lines.insert(0, prev_line.replace('#', '').strip())
                    elif prev_line.startswith('/*') or prev_line.endswith('*/'):
                        docstring_lines.insert(0, re.sub(r'[/\*]', '', prev_line).strip())
                        if prev_line.startswith('/*'):
                            break
                    elif prev_line == "":
                        j -= 1
                        continue
                    else:
                        break
                    j -= 1

                docstring = " ".join(docstring_lines).strip()

                # Extraction du corps de la fonction par comptage d'accolades
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

                # Extraction des arguments
                if language == "java":
                    args_str = match.group(3) if match.lastindex >= 3 else ""
                elif language in ("go", "php"):
                    args_str = match.group(2) if match.lastindex >= 2 else ""
                else:
                    args_str = ""

                # Nettoyage des noms d'arguments
                args = []
                if args_str:
                    for arg_part in args_str.split(','):
                        arg_part = arg_part.strip()
                        if arg_part:
                            # Prendre le dernier mot (nom de variable)
                            arg_name = arg_part.split()[-1] if arg_part.split() else arg_part
                            arg_name = arg_name.replace('...', '').strip()
                            if arg_name and arg_name not in ('', ')'):
                                args.append(arg_name)

                functions.append({
                    "name": name,
                    "language": language,
                    "docstring": docstring,
                    "code": func_code,
                    "arguments": args
                })

        return functions

    @staticmethod
    def parse_javascript(code_content: str) -> List[Dict[str, Any]]:
        return CodeParser._parse_braces_language(code_content, "javascript")

    @staticmethod
    def parse_go(code_content: str) -> List[Dict[str, Any]]:
        """
        Analyse du code Go pour extraire les fonctions.
        Détecte les déclarations 'func Name(params)'.
        """
        functions = []
        lines = code_content.splitlines()

        for i, line in enumerate(lines):
            # Go: func Name(params) returnType { ... }
            match = re.search(r'func\s+(\w+)\s*\(([^)]*)\)', line)
            if match:
                name = match.group(1)
                args_str = match.group(2)

                # Docstring: commentaires au-dessus
                docstring_lines = []
                j = i - 1
                while j >= 0:
                    prev_line = lines[j].strip()
                    if prev_line.startswith('//'):
                        docstring_lines.insert(0, prev_line.replace('//', '').strip())
                    elif prev_line == "":
                        j -= 1
                        continue
                    else:
                        break
                    j -= 1
                docstring = " ".join(docstring_lines).strip()

                # Corps de la fonction
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

                # Extraction des noms d'arguments
                args = []
                if args_str.strip():
                    for arg_part in args_str.split(','):
                        arg_part = arg_part.strip()
                        if arg_part:
                            tokens = arg_part.split()
                            if len(tokens) >= 1:
                                # Go: nom type, ou juste type
                                arg_name = tokens[0] if len(tokens) >= 2 and not tokens[0].startswith(('.', '[', '*')) else tokens[-1]
                                arg_name = arg_name.replace('...', '').strip()
                                if arg_name and arg_name not in ('string', 'int', 'float64', 'bool', 'error', 'byte', 'rune'):
                                    args.append(arg_name)

                functions.append({
                    "name": name,
                    "language": "go",
                    "docstring": docstring,
                    "code": func_code,
                    "arguments": args
                })

        return functions

    @staticmethod
    def parse_java(code_content: str) -> List[Dict[str, Any]]:
        """
        Analyse du code Java pour extraire les méthodes.
        Détecte les signatures avec modificateurs (public, private, etc.).
        """
        functions = []
        lines = code_content.splitlines()

        # Pattern Java: [modifiers] returnType name(params) [throws Exception] {
        pattern = r'(?:(?:public|private|protected|static|final|abstract|synchronized|native)\s+)*(?:<\w+>)?\s*(\w+(?:\[\])*(?:<\w+>)?)\s+(\w+)\s*\(([^)]*)\)\s*(?:throws\s+\w+(?:,\s*\w+)*)?\s*\{'

        for i, line in enumerate(lines):
            match = re.search(pattern, line.strip())
            if match:
                return_type = match.group(1)
                name = match.group(2)
                args_str = match.group(3)

                # Skip les constructeurs? Non, on les garde
                if return_type.lower() in ('if', 'for', 'while', 'switch', 'catch'):
                    continue

                # Docstring: commentaires Javadoc /** ... */
                docstring_lines = []
                j = i - 1
                while j >= 0:
                    prev_line = lines[j].strip()
                    if prev_line.endswith('*/'):
                        docstring_lines.insert(0, re.sub(r'[/\*\s]', '', prev_line).strip())
                        j -= 1
                        while j >= 0 and not lines[j].strip().startswith('/**'):
                            docstring_lines.insert(0, re.sub(r'[\*\s]', '', lines[j].strip()).strip())
                            j -= 1
                        if j >= 0:
                            docstring_lines.insert(0, re.sub(r'[/\*\s]', '', lines[j].strip()).strip())
                        break
                    elif prev_line.startswith('//'):
                        docstring_lines.insert(0, prev_line.replace('//', '').strip())
                    elif prev_line == "":
                        j -= 1
                        continue
                    else:
                        break
                    j -= 1
                docstring = " ".join(docstring_lines).strip()

                # Corps
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

                # Arguments
                args = []
                if args_str.strip():
                    for arg_part in args_str.split(','):
                        arg_part = arg_part.strip()
                        if arg_part and not arg_part.startswith('@'):
                            tokens = arg_part.split()
                            if len(tokens) >= 2:
                                args.append(tokens[-1])  # dernier token = nom
                            elif len(tokens) == 1:
                                args.append(tokens[0])

                functions.append({
                    "name": name,
                    "language": "java",
                    "docstring": docstring,
                    "code": func_code,
                    "arguments": args
                })

        return functions

    @staticmethod
    def parse_php(code_content: str) -> List[Dict[str, Any]]:
        """
        Analyse du code PHP pour extraire les fonctions et méthodes.
        """
        functions = []
        lines = code_content.splitlines()

        # Pattern PHP: function &name(params) ou [modifiers] function name(params)
        pattern = r'(?:(?:public|private|protected|static|abstract|final)\s+)*\s*function\s+(?:&\s*)?(\w+)\s*\(([^)]*)\)'

        for i, line in enumerate(lines):
            match = re.search(pattern, line.strip())
            if match:
                name = match.group(1)
                args_str = match.group(2)

                # Docstring: commentaires au-dessus (/** ... */ ou # ou //)
                docstring_lines = []
                j = i - 1
                while j >= 0:
                    prev_line = lines[j].strip()
                    if prev_line.endswith('*/'):
                        docstring_lines.insert(0, re.sub(r'[/\*\s]', '', prev_line).strip())
                        j -= 1
                        while j >= 0 and not lines[j].strip().startswith('/**'):
                            docstring_lines.insert(0, re.sub(r'[\*\s]', '', lines[j].strip()).strip())
                            j -= 1
                        if j >= 0:
                            docstring_lines.insert(0, re.sub(r'[/\*\s]', '', lines[j].strip()).strip())
                        break
                    elif prev_line.startswith('//') or prev_line.startswith('#'):
                        docstring_lines.insert(0, prev_line.lstrip('/#').strip())
                    elif prev_line == "":
                        j -= 1
                        continue
                    else:
                        break
                    j -= 1
                docstring = " ".join(docstring_lines).strip()

                # Corps
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

                # Arguments PHP (avec types optionnels)
                args = []
                if args_str.strip():
                    for arg_part in args_str.split(','):
                        arg_part = arg_part.strip()
                        if arg_part:
                            tokens = arg_part.split()
                            args.append(tokens[-1].lstrip('$').replace('=', '').strip())
                            if args[-1] == '':
                                args.pop()

                functions.append({
                    "name": name,
                    "language": "php",
                    "docstring": docstring,
                    "code": func_code,
                    "arguments": args
                })

        return functions

    @staticmethod
    def parse_ruby(code_content: str) -> List[Dict[str, Any]]:
        """
        Analyse du code Ruby pour extraire les méthodes (def name ... end).
        """
        functions = []
        lines = code_content.splitlines()
        i = 0
        while i < len(lines):
            line = lines[i]
            # Ruby: def name(params) ou def self.name(params)
            match = re.search(r'def\s+(?:self\.)?(\w+(?:[?!]|=\s*)?)\s*(?:\(([^)]*)\))?', line.strip())
            if match:
                name = match.group(1).rstrip('=')
                args_str = match.group(2) or ""

                # Docstring: commentaires # au-dessus
                docstring_lines = []
                j = i - 1
                while j >= 0:
                    prev_line = lines[j].strip()
                    if prev_line.startswith('#'):
                        docstring_lines.insert(0, prev_line.replace('#', '').strip())
                    elif prev_line == "":
                        j -= 1
                        continue
                    else:
                        break
                    j -= 1
                docstring = " ".join(docstring_lines).strip()

                # Corps: jusqu'au 'end' correspondant
                func_code_lines = [lines[i]]
                end_count = 1  # On a déjà un 'def' qui sera fermé par 'end'
                k = i + 1
                # Gestion du niveau d'imbrication (end, if, do, etc.)
                nesting = 1
                while k < len(lines) and nesting > 0:
                    curr_line = lines[k]
                    func_code_lines.append(curr_line)
                    stripped = curr_line.strip()
                    # Mots qui augmentent le nesting
                    for kw in ['def ', 'if ', 'unless ', 'case ', 'while ', 'until ', 'for ', 'do ', 'begin ', 'class ', 'module ']:
                        if stripped.startswith(kw):
                            nesting += 1
                            break
                    # 'end' diminue le nesting
                    if stripped == 'end' or stripped.startswith('end '):
                        nesting -= 1
                    k += 1

                func_code = "\n".join(func_code_lines)

                # Arguments Ruby
                args = []
                if args_str.strip():
                    for arg_part in args_str.split(','):
                        arg_part = arg_part.strip()
                        if arg_part:
                            # Gestion des arguments avec valeurs par défaut et splat
                            arg_name = arg_part.split('=')[0].strip().lstrip('*').lstrip('&').lstrip('**')
                            if arg_name:
                                args.append(arg_name)

                functions.append({
                    "name": name,
                    "language": "ruby",
                    "docstring": docstring,
                    "code": func_code,
                    "arguments": args
                })

                i = k  # Avancer après la fin de la méthode
            else:
                i += 1

        return functions

    @classmethod
    def parse_file(cls, filepath: str, content: str = None) -> List[Dict[str, Any]]:
        """
        Détermine le parseur approprié selon l'extension du fichier et extrait ses fonctions.
        Supporte: .py, .js, .ts, .go, .java, .php, .rb
        """
        if content is None:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()

        if filepath.endswith('.py'):
            return cls.parse_python(content)
        elif filepath.endswith('.js') or filepath.endswith('.ts'):
            return cls.parse_javascript(content)
        elif filepath.endswith('.go'):
            return cls.parse_go(content)
        elif filepath.endswith('.java'):
            return cls.parse_java(content)
        elif filepath.endswith('.php'):
            return cls.parse_php(content)
        elif filepath.endswith('.rb'):
            return cls.parse_ruby(content)
        return []

