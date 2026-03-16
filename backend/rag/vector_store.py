import faiss
import numpy as np

class VectorStore:

    def __init__(self, dim=384):
        self.index = faiss.IndexFlatL2(dim)
        self.text_chunks = []

    def add(self, embedding, text):
        self.index.add(np.array([embedding]).astype("float32"))
        self.text_chunks.append(text)

    def search(self, embedding, k=3):
        D, I = self.index.search(np.array([embedding]).astype("float32"), k)

        results = []
        for idx in I[0]:
            if idx < len(self.text_chunks):
                results.append(self.text_chunks[idx])

        return results