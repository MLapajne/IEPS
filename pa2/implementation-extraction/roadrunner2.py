from bs4 import BeautifulSoup
import numpy as np

PCDATA = "#PCDATA"
def get_type(token):
    if token.startswith("<") and token.endswith(">"):
        return "tag"

    return "string"

def get_last_tag(i1, cons):
    for i in reversed(range(i1)):
        if cons[i].startswith("</"):
            return cons[i]

def find_tag(i1, cons, last_tag):
    for additional1 in range(i1, len(cons)):
        print("add1", cons[additional1])
        if cons[additional1] == last_tag:
            return additional1

def compare_by_line(cons1, cons2):
    cons1 = [x.strip() for x in cons1]
    cons2 = [x.strip() for x in cons2]

    max1 = len(cons1)
    i1 = 0

    max2 = len(cons2)
    i2 = 0

    saved_repeaters = []
    saved_optionals = []

    while i1 < max1-1 and i2 < max2-1:
        # get types
        type1 = get_type(cons1[i1])
        type2 = get_type(cons2[i2])

        if cons1[i1] != cons2[i2]:
            if type1 == "string" and type2 == "string": # STRING MISMATCH
                if cons1[i1]:
                    cons1[i1] = PCDATA
                if cons2[i2]:
                    cons2[i2] = PCDATA

            if type1 == "tag" and type2 == "tag": # TAG MISMATCH
                last_tag1 = get_last_tag(i1, cons1)
                last_tag2 = get_last_tag(i2, cons2)

                last_tag = None
                if last_tag1 == last_tag2:
                    last_tag = last_tag1

                # je ponavljanje
                if last_tag:
                    found_tag_on_line1 = find_tag(i1, cons1, last_tag)
                    found_tag_on_line2 = find_tag(i2, cons2, last_tag)

                    # ZA 1
                    if found_tag_on_line1 and not found_tag_on_line2:
                        id1_prev_back = i1-1
                        id1_next_back = found_tag_on_line1

                        # go back to check
                        is_whole = True
                        for bi in reversed(range(i1, id1_next_back+1)):
                            if cons1[id1_prev_back] == PCDATA:
                                cons1[bi] = PCDATA
                            elif cons1[bi] != cons1[id1_prev_back]:
                                is_whole = False
                            id1_prev_back -= 1

                        if is_whole:
                            rep_unit = cons1[i1:id1_next_back+1]
                            saved_repeaters.append(rep_unit)
                            i1 = id1_next_back+1


                    # ZA 2
                    if not found_tag_on_line1 and found_tag_on_line2:
                        id2_prev_back = i2-1
                        id2_next_back = found_tag_on_line2

                        # go back to check
                        is_whole = True
                        for bi in reversed(range(i2, id2_next_back+1)):
                            if cons2[id2_prev_back] == PCDATA:
                                cons2[bi] = PCDATA
                            elif cons2[bi] != cons2[id2_prev_back]:
                                is_whole = False
                            id2_prev_back -= 1


                        if is_whole:
                            rep_unit = cons2[i2:id2_next_back+1]
                            saved_repeaters.append(rep_unit)
                            i2 = id2_next_back+1

                # ni ponavljanje
                else:
                    print("optional", cons1[i1], cons2[i2])

                    # najprej za 1
                    found_tag_on_line1 = None
                    for additional1 in range(i1, len(cons1)):
                        if cons1[additional1] == cons2[i2]:
                            found_tag_on_line1 = additional1
                            break

                    # nato se za 2
                    found_tag_on_line2 = None
                    for additional2 in range(i2, len(cons2)):
                        if cons2[additional2] == cons1[i1]:
                            found_tag_on_line2 = additional2
                            break


                    if found_tag_on_line1 and found_tag_on_line2 and found_tag_on_line1 is not None and found_tag_on_line2 is not None:
                        if cons1[i1].startswith("</"):
                            must_add_opt = cons2[i2:found_tag_on_line2+1]
                            saved_optionals.append(must_add_opt)
                            o = 0
                            for x in range(i1, i1+len(must_add_opt)):
                                cons1.insert(x, must_add_opt[o])
                                o += 1
                            i1 = found_tag_on_line1+1
                            i2 = found_tag_on_line2+1

                        if cons2[i2].startswith("</"):
                            saved_optionals.append(cons1[i1:found_tag_on_line1+1])
                            i1 = found_tag_on_line2+1


                    # gledamo za dodatne elemente
                    if found_tag_on_line1 and not found_tag_on_line2:
                        saved_optionals.append(cons1[i1:found_tag_on_line1])
                        i1 = found_tag_on_line1+1


                    if not found_tag_on_line1 and found_tag_on_line2:
                        must_add_opt = cons2[i2:found_tag_on_line2 + 1]
                        saved_optionals.append(must_add_opt)
                        o = 0
                        for x in range(i1, i1 + len(must_add_opt)):
                            cons1.insert(x, must_add_opt[o])
                            o += 1
                        i2 = found_tag_on_line2+1


        if i1 < max1-1:
            i1 += 1
        if i2 < max2-1:
            i2 += 1


    regex_string = "".join(cons1)

    for sr in saved_repeaters:
        if sr:
            sr_string = "".join(sr)
            first_oc = regex_string.find(sr_string)
            regex_string = regex_string.replace(sr_string, "")
            regex_string = regex_string[:first_oc] + "(" + sr_string + ")+" + regex_string[first_oc:]

    for so in saved_optionals:
        if so:
            so_string = "".join(so)
            first_oc = regex_string.find(so_string)
            regex_string = regex_string.replace(so_string, "")
            regex_string = regex_string[:first_oc] + "(" + so_string + ")?" + regex_string[first_oc:]

    print("reg", regex_string)

def roadrunner(all_contents):

    content1 = all_contents[0]
    content2 = all_contents[1]

    parsed1 = BeautifulSoup(content1, 'html.parser')
    parsed2 = BeautifulSoup(content2, 'html.parser')

    for tag in parsed1.recursiveChildGenerator():
        if hasattr(tag, 'attrs'):
            tag.attrs = None

    for tag in parsed2.recursiveChildGenerator():
        if hasattr(tag, 'attrs'):
            tag.attrs = None

    prepared1 = parsed1.body.prettify().split("\n")
    prepared2 = parsed2.body.prettify().split("\n")

    #print(prepared1)
    #print(prepared2)

    compare_by_line(prepared1, prepared2)