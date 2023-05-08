from bs4 import BeautifulSoup, Comment
from classes import Parser

# removes comments and tag attributes and runs prettify() on the html
def preprocess_html(html_string):
    soup = BeautifulSoup(html_string, 'html.parser')

    # removes attributes - not sure if this is ok
    for tag in soup.find_all(True):
        tag.attrs = {}

    # removes comments
    comments = soup.findAll(text=lambda text: isinstance(text, Comment))
    for comment in comments:
        comment.extract()

    return soup.prettify()


def tokenize_html(html):
    parser = Parser()
    parser.feed(html)
    parser.close()
    return parser.token_array


def find_squares(square, terminal_tag_index, wrapper):
    # Define the start and end indices for forward and backward matching
    forward_start = terminal_tag_index + 1
    forward_end = forward_start + len(square)
    backward_end = terminal_tag_index + 1
    backward_start = backward_end - len(square)

    iterations_start = terminal_tag_index + 1
    iterations_end = terminal_tag_index + 1

    # Check for forward matches
    while forward_end <= len(wrapper):
        # check = wrapper[forward_start:forward_end]
        wrapper_square = wrapper[forward_start:forward_end]

        has_tag_mismatch = False
        for i in range(len(square)):
            if wrapper_square[i] != square[i]:
                if not wrapper_square[i].startswith('<') and not square[i].startswith('<'):
                    square[i] = '#PCDATA'
                else:
                    has_tag_mismatch = True
                    break
        if has_tag_mismatch:
            break
        else:
            iterations_end = forward_end
            forward_start = forward_end
            forward_end += len(square)


    # Check for backward matches
    while backward_start >= 0:
        wrapper_square = wrapper[backward_start:backward_end]
        has_tag_mismatch = False
        for i in range(len(square)):
            if wrapper_square[i] != square[i]:
                if not wrapper_square[i].startswith('<') and not square[i].startswith('<'):
                    square[i] = '#PCDATA'
                else:
                    has_tag_mismatch = True
                    break
        if has_tag_mismatch:
            break
        else:
            iterations_start = backward_start
            backward_end = backward_start
            backward_start -= len(square)

    # return start and end index of iterations
    return iterations_start, iterations_end, square


def modify_wrapper(iteration_start, iteration_end, regex, wrapper):
    # Replace the element at iteration_start with regex
    wrapper[iteration_start] = regex

    # Replace the elements from iteration_start + 1 to iteration_end with empty strings
    # This is to keep the same indices as html_1
    for i in range(iteration_start + 1, iteration_end):
        wrapper[i] = ''
    return wrapper

def modify_wrapper_opt(wrapper, optional_content, iterator_wrapper):
    temp = optional_content.copy()
    temp[0] = '(' + optional_content[0]
    temp[-1] += ')?'

    wrapper[iterator_wrapper : iterator_wrapper + len(temp)] = temp
    print(wrapper)

def modify_wrapper_opt_insert(wrapper, optional_content, iterator_wrapper):
    temp = optional_content.copy()
    temp[0] = '(' + optional_content[0]
    temp[-1] += ')?'

    insert = ''.join(temp)

    wrapper[iterator_wrapper - 1] += insert
    print(wrapper)

def roadrunner(html_1, html_2):
    processed_html_1 = preprocess_html(html_1)
    processed_html_2 = preprocess_html(html_2)

    tokenized_1 = tokenize_html(processed_html_1)
    tokenized_2 = tokenize_html(processed_html_2)
    wrapper = tokenized_1.copy()

    print(tokenized_1)
    print(tokenized_2)

    iterator_wrapper = 0
    iterator_sample = 0

    while iterator_wrapper < len(tokenized_1) and iterator_sample < len(tokenized_2):
        print("Comparing: " + tokenized_1[iterator_wrapper] + " " + tokenized_2[iterator_sample])

        # check for match
        if tokenized_1[iterator_wrapper] == tokenized_2[iterator_sample]:
            print("Strings match")
            iterator_wrapper += 1
            iterator_sample += 1

        # check for string mismatch
        elif not tokenized_1[iterator_wrapper].startswith('<') and not tokenized_2[iterator_sample].startswith('<'):
            print("String mismatch: " + tokenized_1[iterator_wrapper] + " " + tokenized_2[iterator_sample])
            wrapper[iterator_wrapper] = '#PCDATA'
            tokenized_1[iterator_wrapper] = '#PCDATA'
            iterator_wrapper += 1
            iterator_sample += 1

        # tag mismatch
        else:
            print("Tag mismatch: " + tokenized_1[iterator_wrapper] + " " + tokenized_2[iterator_sample])
            print("Terminal tag: " + tokenized_1[iterator_wrapper - 1])
            print("\n")

            continue_index_html_1 = -1
            continue_index_html_2 = -1

            terminal_tag = tokenized_1[iterator_wrapper - 1]
            terminal_tag_index_wrapper = iterator_wrapper - 1
            terminal_tag_index_sample = iterator_sample - 1

            found_square_in_wrapper = False
            # search wrapper (html_1) from i to finish
            for k in range(iterator_wrapper + 1, len(tokenized_1)):
                # check for occurrence of terminal tag
                if tokenized_1[k] == terminal_tag:
                    discovered_tag_index = k

                    print("Found terminal tag on wrapper, index: " + str(k))
                    print("Potential square starts: " + str(terminal_tag_index_wrapper + 1) + " ends: " + str(k))

                    square_length = discovered_tag_index - terminal_tag_index_wrapper

                    # perform backwards matching
                    iterator = 0
                    mismatch_present = False

                    while iterator < square_length:
                        if tokenized_1[discovered_tag_index - iterator] == tokenized_1[
                            terminal_tag_index_wrapper - iterator]:
                            # print("Tokens match: " + tokenized_1[discovered_tag_index - iterator])
                            pass

                        elif not tokenized_1[discovered_tag_index - iterator].startswith('<') and not tokenized_1[
                            terminal_tag_index_wrapper - iterator].startswith('<'):
                            # print("Only string mismatch: " + tokenized_1[discovered_tag_index - iterator])
                            # string mismatch - #PCDATA
                            tokenized_1[discovered_tag_index - iterator] = "#PCDATA"
                            tokenized_1[terminal_tag_index_wrapper - iterator] = "#PCDATA"
                        else:
                            #print("Tokens don't match: " + tokenized_1[discovered_tag_index - iterator])
                            mismatch_present = True
                            break
                        iterator += 1

                    if not mismatch_present:
                        print("Square found, start: " + str(terminal_tag_index_wrapper + 1) + " end: " + str(
                            discovered_tag_index + 1))

                        square_found = tokenized_1[discovered_tag_index - square_length + 1:discovered_tag_index + 1]

                        continue_index_html_1 = discovered_tag_index + 1

                        # match squares in wrapper and replace with regex
                        start, end, sq = find_squares(square_found, terminal_tag_index_wrapper, wrapper)
                        square_regex = '(' + ''.join(sq) + ')' + '+'

                        # modify wrapper
                        wrapper = modify_wrapper(start, end, square_regex, wrapper)
                        found_square_in_wrapper = True
                        break

                    else:
                        print("Square not found")

            if not found_square_in_wrapper:
                # search sample (html_2) from i to finish
                for k in range(iterator_sample + 1, len(tokenized_2)):
                    if tokenized_2[k] == terminal_tag:
                        discovered_tag_index = k

                        print("Found terminal tag on sample, index: " + str(k))
                        print("Potential square starts: " + str(terminal_tag_index_sample + 1) + " ends: " + str(k))

                        square_length = discovered_tag_index - terminal_tag_index_sample

                        # perform backswards matching
                        iterator = 0
                        mismatch_present = False
                        while iterator < square_length:
                            if tokenized_2[discovered_tag_index - iterator] == tokenized_2[
                                terminal_tag_index_sample - iterator]:
                                # print("Tokens match: " + tokenized_2[discovered_tag_index - iterator])
                                pass
                            elif not tokenized_2[discovered_tag_index - iterator].startswith('<') and not tokenized_2[
                                terminal_tag_index_sample - iterator].startswith('<'):
                                # print("Only string mismatch: " + tokenized_2[discovered_tag_index - iterator])
                                # string mismatch - #PCDATA
                                tokenized_2[discovered_tag_index - iterator] = "#PCDATA"
                                tokenized_2[terminal_tag_index_sample - iterator] = "#PCDATA"
                            else:
                                # print("Tokens don't match: " + tokenized_2[discovered_tag_index - iterator])
                                mismatch_present = True
                                break
                            iterator += 1

                        if not mismatch_present:
                            print("Square found, start: " + str(terminal_tag_index_sample + 1) + " end: " + str(
                                discovered_tag_index + 1))
                            square_found = tokenized_2[
                                           discovered_tag_index - square_length + 1:discovered_tag_index + 1]

                            continue_index_html_2 = discovered_tag_index + 1

                            # match squares in wrapper and replace with regex
                            start, end, sq = find_squares(square_found, terminal_tag_index_wrapper, wrapper)
                            square_regex = '(' + ''.join(sq) + ')' + '+'
                            wrapper = modify_wrapper(start, end, square_regex, wrapper)
                            break

                        else:
                            print("Square not found")

            if continue_index_html_2 != -1:
                iterator_sample = continue_index_html_2

            if continue_index_html_1 != -1:
                iterator_wrapper = continue_index_html_1

            if continue_index_html_1 == -1 and continue_index_html_2 == -1:
                print("optional parameter")

                ix_wrapper = iterator_wrapper
                ix_sample = iterator_sample
                while ix_wrapper + 1 < len(tokenized_1) or ix_sample + 1 < len(tokenized_2):
                    if ix_wrapper + 1 < len(tokenized_1) and tokenized_1[ix_wrapper] == tokenized_2[iterator_sample]:
                        # optional is on wrapper
                        optional_content = tokenized_1[iterator_wrapper:ix_wrapper]
                        modify_wrapper_opt(wrapper, optional_content, iterator_wrapper)
                        iterator_wrapper = ix_wrapper
                        break

                    if ix_sample + 1 < len(tokenized_2) and tokenized_1[iterator_wrapper] == tokenized_2[ix_sample]:
                        # optional is on sample
                        optional_content = tokenized_2[iterator_sample:ix_sample]
                        modify_wrapper_opt_insert(wrapper, optional_content, iterator_wrapper)
                        iterator_sample = ix_sample
                        break


                    ix_wrapper += 1
                    ix_sample += 1

    final_regex = ''.join(wrapper)
    print("Final regex: ")
    print(final_regex)
    return final_regex