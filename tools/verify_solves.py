import glob, json, sys
from cube import parse
from check_solve import check, SOLVED

bad = 0
for f in glob.glob("../data/solves/*.json"):
    for sv in json.load(open(f))["solves"]:
        print(f"== {sv['id']}")
        end = check(sv["scramble"], [(s["step"], s["moves"]) for s in sv["steps"]])
        if end != SOLVED:
            bad += 1; print("!! does not solve the cube")
sys.exit(1 if bad else 0)
