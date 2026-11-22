import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from check_ci import evaluar  # noqa: E402

OK = {"result": "success"}


class JobPuerta(unittest.TestCase):
    def base(self, **cambios):
        needs = {"gitleaks": OK, "codeql": OK, "web": OK, "convenciones": OK, "archivos": OK}
        needs.update(cambios)
        return needs

    def test_todo_en_verde_aprueba(self):
        self.assertEqual(evaluar(self.base(), "pull_request"), [])

    def test_un_job_fallido_rechaza(self):
        self.assertTrue(evaluar(self.base(web={"result": "failure"}), "pull_request"))

    def test_cancelado_rechaza(self):
        self.assertTrue(evaluar(self.base(codeql={"result": "cancelled"}), "push"))

    def test_seguridad_nunca_se_omite(self):
        self.assertTrue(evaluar(self.base(gitleaks={"result": "skipped"}), "push"))

    def test_jobs_de_pr_se_omiten_en_push(self):
        n = self.base(convenciones={"result": "skipped"}, archivos={"result": "skipped"})
        self.assertEqual(evaluar(n, "push"), [])

    def test_jobs_de_pr_no_se_omiten_en_pr(self):
        self.assertTrue(evaluar(self.base(archivos={"result": "skipped"}), "pull_request"))

    def test_convenciones_omitida_para_bots(self):
        self.assertEqual(evaluar(self.base(convenciones={"result": "skipped"}), "pull_request", "Bot"), [])

    def test_falta_job_obligatorio(self):
        n = self.base(); del n["codeql"]
        self.assertTrue(evaluar(n, "push"))


if __name__ == "__main__":
    unittest.main()
