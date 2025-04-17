import string

def set_next_letter(letter):
    alphabet = list(string.ascii_uppercase)
    if letter in alphabet:
        index = alphabet.index(letter)
        return alphabet[index + 1] if index + 1 < len(alphabet) else None

    return None

