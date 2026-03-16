from rag.embedder import embed_text
from rag.vector_store import VectorStore

knowledge = [
    "Carbon black N330 improves tensile and tear strength in NR",
    "Sulfur vulcanization improves crosslink density",
    "High molecular weight NR increases tear resistance",
    "TMQ antioxidant improves aging resistance",
    "Silica reinforcement improves abrasion resistance"
]

vector_store = VectorStore()

for text in knowledge:
    emb = embed_text(text)
    vector_store.add(emb, text)


def should_retrieve(query: str) -> bool:
    q = query.strip().lower().replace("?", "")

    smalltalk = {
        "hi", "hello", "hey", "thanks", "thank you",
        "good morning", "good evening"
    }

    basic_questions = {
        "what is rubber",
        "define rubber",
        "what is elastomer",
        "define elastomer"
    }

    if q in smalltalk or q in basic_questions:
        return False

    return True


def retrieve_context(query):
    if not should_retrieve(query):
        return ""

    emb = embed_text(query)
    results = vector_store.search(emb, k=2)

    context = "\n".join(results)[:500]
    return context