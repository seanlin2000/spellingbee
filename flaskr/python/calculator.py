import math

from flaskr.python.scraper import fetch_spelling_bee

RANKINGS = {
    "Beginner": 0, 
    "Good Start": 2,
     "Moving Up": 5, 
     "Good": 8, 
     "Solid": 15, 
     "Nice": 25, 
     "Great": 40, 
     "Amazing": 50, 
     "Genius": 70,
     "Queen Bee": 100
     }


def nyt_round(x):
  frac = x - math.floor(x)
  if frac < 0.5: return math.floor(x)
  return math.ceil(x)

def compute_max_score(answers, pangrams):
    max_score = 0
    for answer in answers:
        if len(answer) == 4:
            max_score += 1
            continue
    
        if answer in pangrams:
            max_score += 7
        max_score += len(answer)
    return max_score

def compute_rankings(max_score):
    ranking_scores = {}
    for ranking in RANKINGS:
        cutoff = RANKINGS[ranking]
        cutoff_score = nyt_round((cutoff / 100) * max_score)
        ranking_scores[ranking] = cutoff_score
    return ranking_scores

if __name__ == '__main__':
    info = fetch_spelling_bee()
    max_score = compute_max_score(info['answers'], info['pangrams'])
    print("Max Score:", max_score)
    for ranking in RANKINGS:
        cutoff = RANKINGS[ranking]
        print(f"Minimum Score for {ranking} rank: {nyt_round((cutoff / 100) * max_score)}")
