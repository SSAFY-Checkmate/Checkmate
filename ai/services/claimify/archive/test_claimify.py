#!/usr/bin/env python3
"""
Test script for the Claimify project.
Validates setup and tests basic functionality.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add the current directory to the path so we can import our modules
sys.path.insert(0, str(Path(__file__).parent))

def test_imports():
    """Test that all required modules can be imported."""
    print("Testing imports...")
    
    try:
        import nltk
        print("✓ NLTK imported")
    except ImportError as e:
        print(f"✗ Failed to import NLTK: {e}")
        return False
    
    try:
        from llm_client import LLMClient
        print("✓ LLMClient imported")
    except ImportError as e:
        print(f"✗ Failed to import LLMClient: {e}")
        return False
    
    try:
        from pipeline import ClaimifyPipeline
        print("✓ ClaimifyPipeline imported")
    except ImportError as e:
        print(f"✗ Failed to import ClaimifyPipeline: {e}")
        return False
    
    try:
        from structured_prompts import STRUCTURED_SELECTION_SYSTEM_PROMPT, STRUCTURED_DISAMBIGUATION_SYSTEM_PROMPT, STRUCTURED_DECOMPOSITION_SYSTEM_PROMPT
        print("✓ Prompts imported")
    except ImportError as e:
        print(f"✗ Failed to import prompts: {e}")
        return False
    
    return True


def test_environment():
    """Test environment configuration."""
    print("\nTesting environment configuration...")
    load_dotenv()
    
    provider = os.getenv("LLM_PROVIDER", "openai").lower()
    print(f"✓ LLM Provider: {provider}")
    
    if provider == "openai":
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key or api_key == "your-openai-api-key-here":
            print("✗ OPENAI_API_KEY not set or using placeholder value")
            return False
        else:
            print(f"✓ OpenAI API key configured (length: {len(api_key)})")
    elif provider == "anthropic":
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key or api_key == "your-anthropic-api-key-here":
            print("✗ ANTHROPIC_API_KEY not set or using placeholder value")
            return False
        else:
            print(f"✓ Anthropic API key configured (length: {len(api_key)})")
    else:
        print(f"✗ Unknown LLM provider: {provider}")
        return False
    
    model = os.getenv("LLM_MODEL", "gpt-4o")
    print(f"✓ Model: {model}")
    print("✓ Using stdio transport (no port needed)")
    
    return True


def test_nltk_data():
    """Test NLTK data availability."""
    print("\nTesting NLTK data...")
    
    try:
        import nltk
        try:
            nltk.data.find('tokenizers/punkt_tab')
            print("✓ NLTK punkt_tab tokenizer available")
            return True
        except LookupError:
            try:
                nltk.data.find('tokenizers/punkt')
                print("✓ NLTK punkt tokenizer available")
                return True
            except LookupError:
                print("✗ NLTK tokenizer not found")
                print("  Run: python -c \"import nltk; nltk.download('punkt_tab')\" or python -c \"import nltk; nltk.download('punkt')\"")
                return False
    except Exception as e:
        print(f"✗ NLTK test failed: {e}")
        return False


def test_prompts():
    """Test prompt loading."""
    print("\nTesting prompts...")
    
    try:
        from structured_prompts import STRUCTURED_SELECTION_SYSTEM_PROMPT, STRUCTURED_DISAMBIGUATION_SYSTEM_PROMPT, STRUCTURED_DECOMPOSITION_SYSTEM_PROMPT
        
        if STRUCTURED_SELECTION_SYSTEM_PROMPT.startswith('#'):
            print("✗ Selection prompt appears to be placeholder content")
            return False
        else:
            print(f"✓ Selection prompt loaded (length: {len(STRUCTURED_SELECTION_SYSTEM_PROMPT)})")
        
        if STRUCTURED_DISAMBIGUATION_SYSTEM_PROMPT.startswith('#'):
            print("✗ Disambiguation prompt appears to be placeholder content")
            return False
        else:
            print(f"✓ Disambiguation prompt loaded (length: {len(STRUCTURED_DISAMBIGUATION_SYSTEM_PROMPT)})")
        
        if STRUCTURED_DECOMPOSITION_SYSTEM_PROMPT.startswith('#'):
            print("✗ Decomposition prompt appears to be placeholder content")
            return False
        else:
            print(f"✓ Decomposition prompt loaded (length: {len(STRUCTURED_DECOMPOSITION_SYSTEM_PROMPT)})")
        
        return True
    except Exception as e:
        print(f"✗ Error loading prompts: {e}")
        return False


def test_llm_client():
    """Test LLM client initialization."""
    print("\nTesting LLM client...")
    
    try:
        from llm_client import LLMClient
        client = LLMClient()
        print(f"✓ LLM client initialized for {client.provider} with model {client.model}")
        return True
    except Exception as e:
        print(f"✗ Failed to initialize LLM client: {e}")
        return False


def test_pipeline_basic():
    """Test basic pipeline functionality without making API calls."""
    print("\nTesting pipeline (sentence splitting only)...")
    
    try:
        from pipeline import split_into_sentences, create_context_for_sentence
        
        test_text = "This is the first sentence. This is the second sentence.\nThis is a third sentence on a new line."
        sentences = split_into_sentences(test_text)
        
        if len(sentences) == 3:
            print(f"✓ Sentence splitting works (found {len(sentences)} sentences)")
        else:
            print(f"✗ Sentence splitting unexpected result (found {len(sentences)} sentences, expected 3)")
            return False
        
        context = create_context_for_sentence(sentences, 1, 1, 1)
        if len(context.split('\n')) == 3:
            print("✓ Context creation works")
        else:
            print("✗ Context creation unexpected result")
            return False
        
        return True
    except Exception as e:
        print(f"✗ Pipeline test failed: {e}")
        return False


def test_api_connection():
    """Test actual API connection (optional, requires valid API key)."""
    print("\nTesting API connection (optional)...")
    
    try:
        from llm_client import LLMClient
        from pydantic import BaseModel
        
        class TestResponse(BaseModel):
            message: str

        client = LLMClient()
        
        # Make a simple test request
        response = client.make_structured_request(
            system_prompt="You are a helpful assistant.",
            user_prompt="Say 'test successful' if you can read this.",
            response_model=TestResponse,
            stage="test"
        )
        
        if response and "test successful" in response.message.lower():
            print("✓ API connection successful")
            return True
        elif response:
            print(f"✓ API connection works, got response: {response.message[:50]}...")
            return True
        else:
            print("✗ API returned empty response")
            return False
            
    except Exception as e:
        print(f"⚠ API test failed (this may be expected if API keys aren't configured): {e}")
        return False


def main():
    """Run all tests."""
    print("🧪 Running Claimify tests...\n")
    
    tests = [
        ("Imports", test_imports),
        ("Environment", test_environment), 
        ("NLTK Data", test_nltk_data),
        ("Prompts", test_prompts),
        ("LLM Client", test_llm_client),
        ("Pipeline Basic", test_pipeline_basic),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"✗ {test_name} test crashed: {e}")
            results.append((test_name, False))
        print()
    
    # Optional API test
    print("=" * 50)
    print("Optional API test (requires valid API key):")
    try:
        api_result = test_api_connection()
        results.append(("API Connection", api_result))
    except Exception as e:
        print(f"API test skipped: {e}")
        results.append(("API Connection", None))
    
    # Summary
    print("\n" + "=" * 50)
    print("TEST SUMMARY:")
    
    passed = 0
    failed = 0
    skipped = 0
    
    for test_name, result in results:
        if result is True:
            print(f"✓ {test_name}")
            passed += 1
        elif result is False:
            print(f"✗ {test_name}")
            failed += 1
        else:
            print(f"⚠ {test_name} (skipped)")
            skipped += 1
    
    print(f"\nPassed: {passed}, Failed: {failed}, Skipped: {skipped}")
    
    if failed == 0:
        print("\n🎉 All critical tests passed! Your setup looks good.")
        print("You can now run: python claimify_server.py")
    else:
        print(f"\n❌ {failed} test(s) failed. Please check the issues above.")
        print("See README.md for troubleshooting help.")
    
    return failed == 0


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 