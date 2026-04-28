def text_cleansing_step(state: dict) -> dict:
    # TODO: Text cleansing logic here
    state["cleansed_text"] = state.get("preprocessed_text", "")
    return state
