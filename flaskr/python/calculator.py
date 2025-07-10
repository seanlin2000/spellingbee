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

def compute_score(answers, pangrams):
    score = 0
    for answer in answers:
        if len(answer) == 4:
            score += 1
            continue
    
        if answer in pangrams:
            score += 7
        score += len(answer)
    return score

def find_rank(found_words, answers, pangrams):
    score = compute_score(found_words, pangrams)
    max_score = compute_score(answers, pangrams)

    ranking_scores = compute_rankings(max_score)

    descending_point_order_rankings = dict(sorted(ranking_scores.items(), key=lambda item: item[1], reverse=True))
    next_rank, curr_rank = None, None
    for ranking in descending_point_order_rankings:
        cutoff = descending_point_order_rankings[ranking]
        if score > cutoff:
            curr_rank = ranking
            break
        next_rank = ranking
    return curr_rank, next_rank

def compute_points_to_next_rank(found_words, answers, pangrams):
    score = compute_score(found_words, pangrams)
    max_score = compute_score(answers, pangrams)

    ranking_scores = compute_rankings(max_score)
    curr_rank, next_rank = find_rank(found_words, answers, pangrams)
    return ranking_scores[next_rank] - score


def compute_rankings(max_score):
    ranking_scores = {}
    for ranking in RANKINGS:
        cutoff = RANKINGS[ranking]
        cutoff_score = nyt_round((cutoff / 100) * max_score)
        ranking_scores[ranking] = cutoff_score
    return ranking_scores

if __name__ == '__main__':
    info = fetch_spelling_bee()
    max_score = compute_score(info['answers'], info['pangrams'])
    print("Max Score:", max_score)
    for ranking in RANKINGS:
        cutoff = RANKINGS[ranking]
        print(f"Minimum Score for {ranking} rank: {nyt_round((cutoff / 100) * max_score)}")
