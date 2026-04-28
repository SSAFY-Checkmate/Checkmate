def preprocess_sentences_step(state: dict) -> dict:
    """TODO: Sentence Preprocessing"""
    text = state["text"]

    state["preprocessed_text"] = text
    return state
