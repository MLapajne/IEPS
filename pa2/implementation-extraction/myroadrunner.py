from bs4 import BeautifulSoup

PCDATA = "PCDATA"
TAG = "TAG"
STRING = "STRING"
def get_type(token):
    if '<' in token and '>' in token:
        return "TAG"

    return "STRING"

def tag_mismatch(type1, type2, token1, token2):
    if (type1 == TAG and type2 == STRING) or (type1 == STRING and type2 == TAG):
        return True

    if type1 == TAG and type2 == TAG and token1 != token2:
        return True

    return False

def get_last_tag(i, tokens):
    for i in reversed(range(i)):
        if tokens[i].startswith("</"):
            return tokens[i]

def find_tag(i, tokens, last_tag):
    for token in range(i, len(tokens)):
        if tokens[token] == last_tag:
            return token

def road_runner(html1, html2):
    parsed1 = BeautifulSoup(html1, 'html.parser')
    parsed2 = BeautifulSoup(html2, 'html.parser')

    for tag in parsed1.recursiveChildGenerator():
        if hasattr(tag, 'attrs'):
            tag.attrs = None

    for tag in parsed2.recursiveChildGenerator():
        if hasattr(tag, 'attrs'):
            tag.attrs = None

    i1 = 0
    i2 = 0

    repeating_sections = []
    optional_sections = []
    wrapper = []

    tokens1 = parsed1.body.prettify().split("\n")
    tokens2 = parsed2.body.prettify().split("\n")

    tokens1 = [token.strip() for token in tokens1]
    tokens2 = [token.strip() for token in tokens2]

    while i1 < len(tokens1) and i2 < len(tokens2):
        type1 = get_type(tokens1[i1])
        type2 = get_type(tokens2[i2])

        if type1 == STRING and type2 == STRING: # we have a string mismatch
            if len(tokens1[i1]) > 0:
                tokens1[i1] = PCDATA
            if len(tokens2[i2]) > 0:
                tokens2[i2] = PCDATA

        if tag_mismatch(type1, type2, tokens1[i1], tokens2[i2]):  # we have a tag mismatch
            last_tag1 = get_last_tag(i1, tokens1)
            last_tag2 = get_last_tag(i2, tokens2)

            if last_tag1 == last_tag2:
                found_tag_on_line1 = find_tag(i1, tokens1, last_tag1)
                found_tag_on_line2 = find_tag(i2, tokens2, last_tag1)

                if found_tag_on_line1 and not found_tag_on_line2: # check if tag is repeated in tokens1 and not in tokens2
                    last_line_index1 = found_tag_on_line1
                    prev_i1 = i1-1

                    is_repeating = True
                    for bi in reversed(range(i1, last_line_index1 + 1)):
                        if tokens1[prev_i1] == PCDATA:
                            tokens1[bi] = PCDATA
                        elif tokens1[bi] != tokens1[prev_i1]:
                            is_repeating = False
                        prev_i1 -= 1

                    if is_repeating:
                        section = tokens1[i1:last_line_index1+1]
                        repeating_sections.append(section)
                        if section not in wrapper:
                            wrapper.append(section)

                if not found_tag_on_line1 and found_tag_on_line2:
                    last_line_index2 = found_tag_on_line2
                    prev_i2 = i2 - 1

                    is_repeating = True
                    for bi in reversed(range(i2, last_line_index2 + 1)):
                        if tokens2[prev_i2] == PCDATA:
                            tokens2[bi] = PCDATA
                        elif tokens2[bi] != tokens2[prev_i2]:
                            is_repeating = False
                        prev_i2 -= 1

                    if is_repeating:
                        section = tokens1[i2:last_line_index2 + 1]
                        repeating_sections.append(section)
                        if section not in wrapper:
                            wrapper.append(section)

            else: # check if section is optional
                found_tag_on_line1 = find_tag(i1, tokens1, last_tag1)
                found_tag_on_line2 = find_tag(i2, tokens2, last_tag1)

                # no repeating sequence between the two, find optional tags
                if found_tag_on_line1 and found_tag_on_line2 and found_tag_on_line1 is not None and found_tag_on_line2 is not None:
                    if tokens1[i1].startswith("</"):
                        optional_section = tokens2[i2:found_tag_on_line2 + 1]
                        if optional_section not in optional_sections:
                            optional_sections.append(optional_section)
                        optional_sections.append(optional_section)
                        i = 0
                        for x in range(i1, i1 + len(optional_section)):
                            tokens1.insert(x, optional_section[i])
                            i += 1

                        i1 = found_tag_on_line1 + 1
                        i2 = found_tag_on_line2 + 1

                    if tokens2[i2].startswith("</"):
                        optional_section = tokens1[i1:found_tag_on_line1 + 1]
                        if optional_section not in optional_sections:
                            optional_sections.append(optional_section)
                        i1 = found_tag_on_line2 + 1

                    # gledamo za dodatne elemente
                    if found_tag_on_line1 and not found_tag_on_line2:
                        optional_sections.append(tokens1[i1:found_tag_on_line1])
                        i1 = found_tag_on_line1 + 1

                    if not found_tag_on_line1 and found_tag_on_line2:
                        optional_section = tokens2[i2:found_tag_on_line2 + 1]
                        optional_sections.append(optional_section)
                        i = 0
                        for x in range(i1, i1 + len(optional_section)):
                            tokens1.insert(x, optional_section[i])
                            i += 1
                        i2 = found_tag_on_line2 + 1


        i1 += 1
        i2 += 1

    regex = "".join(tokens1)
    for sr in repeating_sections:
        sr_string = "".join(sr)
        first_oc = regex.find(sr_string)
        regex = regex.replace(sr_string, "")
        regex = regex[:first_oc] + "(" + sr_string + ")+" + regex[first_oc:]

    for so in optional_sections:
        so_string = "".join(so)
        first_oc = regex.find(so_string)
        regex = regex.replace(so_string, "")
        regex = regex[:first_oc] + "(" + so_string + ")?" + regex[first_oc:]

    return regex



