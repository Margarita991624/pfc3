import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from check_codeql import hallazgos_graves  # noqa: E402


def sarif(sev, suprimido=False):
    res = {"ruleId": "js/x", "locations": [{"physicalLocation": {"artifactLocation": {"uri": "lib/a.ts"}, "region": {"startLine": 3}}}]}
    if suprimido:
        res["suppressions"] = [{"kind": "inSource"}]
    return {"runs": [{"tool": {"driver": {"rules": [{"id": "js/x", "properties": {"security-severity": sev}}]}}, "results": [res]}]}


class PoliticaSeveridad(unittest.TestCase):
    def test_alta_bloquea(self):
        self.assertEqual(len(hallazgos_graves(sarif("8.8"))), 1)

    def test_critica_bloquea(self):
        self.assertEqual(len(hallazgos_graves(sarif("9.8"))), 1)

    def test_media_no_bloquea(self):
        self.assertEqual(hallazgos_graves(sarif("5.0")), [])

    def test_suprimida_no_bloquea(self):
        self.assertEqual(hallazgos_graves(sarif("9.8", suprimido=True)), [])

    def test_sin_resultados(self):
        self.assertEqual(hallazgos_graves({"runs": []}), [])


if __name__ == "__main__":
    unittest.main()
