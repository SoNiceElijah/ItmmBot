import xlrd
import json
import sys 

sys.argv.append("./data/data3.xls")
sys.argv.append("test")
sys.argv.append(6)
sys.argv.append(9)

start_offset = int(sys.argv[4])

time_array = ["7:30", "9:10", "10:50", "13:00", "14:40", "16:20", "18:00", "19:40"]
day_array = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
week_array = ["UP", "DOWN"]
group_array = []

time_table = []

MAX_WIDTH = 2
MAX_HEIGHT = start_offset
MIN_WIDTH = 2
MIN_HEIGHT = start_offset

def is_left_border(i,j):

    if(i == MIN_WIDTH):
        return True

    o = 1
    k = i
    while(sheet.colinfo_map[k - 1].hidden and k > MIN_WIDTH):
        o += 1
        k -= 1

    cell = sheet.cell(j,i)
    style = wb.xf_list[cell.xf_index]
    b = style.border

    b1 =  b.left_line_style != 0

    cell = sheet.cell(j ,i - o)
    style = wb.xf_list[cell.xf_index]
    b = style.border

    b2 = b.right_line_style != 0

    return b1 or b2

def is_right_border(i,j):

    if(i == MAX_WIDTH):
        return True

    o = 1
    k = i
    while(sheet.colinfo_map[k + 1].hidden and k < MAX_WIDTH):
        o += 1
        k += 1

    cell = sheet.cell(j,i)
    style = wb.xf_list[cell.xf_index]
    b = style.border

    b1 =  b.right_line_style != 0

    cell = sheet.cell(j ,i + o)
    style = wb.xf_list[cell.xf_index]
    b = style.border

    b2 = b.left_line_style != 0

    return b1 or b2

def is_bottom_border(i,j):

    if(j == MAX_HEIGHT):
        return True

    cell = sheet.cell(j,i)
    style = wb.xf_list[cell.xf_index]
    b = style.border

    b1 =  b.bottom_line_style != 0

    cell = sheet.cell(j + 1 ,i)
    style = wb.xf_list[cell.xf_index]
    b = style.border

    b2 = b.top_line_style != 0

    return b1 or b2 

def is_top_border(i,j):

    if(j == MIN_HEIGHT):
        return True

    cell = sheet.cell(j,i)
    style = wb.xf_list[cell.xf_index]
    b = style.border

    b1 =  b.top_line_style != 0

    cell = sheet.cell(j - 1 ,i)
    style = wb.xf_list[cell.xf_index]
    b = style.border

    b2 = b.bottom_line_style != 0

    return b1 or b2 


def block(i,j):
    if(i == 28 and j == 70):
        v = 10

    #Move left top
    while(not is_left_border(i,j)):
        i += -1
    while(not is_top_border(i,j)):
        j += -1


    data = ""

    cell = sheet.cell(j,i)
    #style = wb.xf_list[cell.xf_index]

    #if(style.background.pattern_colour_index == 64 and cell.value == '') :
        #print(':' + cell.value + ': lol')
        #return ""
 
    if(type(cell.value) == float):
        cell.value = int(cell.value)
    data += str(cell.value).strip()

    bb = is_bottom_border(i,j)
    bl = is_left_border(i,j)
    br = is_right_border(i,j)
    bt = is_top_border(i,j)

    while not (bb and  bl and br and bt) :

        if not bt:
            j = j - 1
        elif not bb:
            j = j + 1
        elif not br:
            i = i + 1
            bt = False
            bb = False
        
        try:
            cell = sheet.cell(j,i)
            if(type(cell.value) == float):
                cell.value = int(cell.value)
            data += " " + str(cell.value).strip()

            bb = is_bottom_border(i,j) or bb
            bl = is_left_border(i,j) or bl
            br = is_right_border(i,j) or br
            bt = is_top_border(i,j) or bt
        except Exception:
            return data
    
    if(data.isspace()):
        return ""
    else:
        return data

with open(sys.argv[2] + ".log", "w",  encoding='utf8') as log:
    try:

        wb = xlrd.open_workbook(sys.argv[1], formatting_info=True)
        sheet = wb.sheet_by_index(0)

        log.write( str(sheet.ncols) + " " + str(sheet.nrows) + "\n")

        group_offset = int(sys.argv[3])
        group_buff = ""
        for i in range(2, sheet.ncols):
            sr = str(sheet.cell(group_offset,i).value)

            nr = ''
            try: 
                nr = str(sheet.cell(group_offset,i + 1).value)
            except Exception:
                nr = ''

            if(not (sr.isspace() or sr == '')):
                group_buff = sr
            

            log.write(str(i) + " <- i\n")
            group_array.append(group_buff.strip())

            if((sr.isspace() or sr == '') and (nr.isspace() or nr == '')):
                break

            
        for i in group_array:
            log.write(i + '\n')

        if(group_array.__len__() == 0):
            log.write("WRONG INPUT!!!!!\n")

        time = ""
        day = ""
        week = ""
        group = ""
        subgroup = ""
        content = ""


        log.write(str(2 + group_array.__len__()) + " <- final width lenght\n")

        MIN_HEIGHT = start_offset
        MAX_WIDTH = 2 + group_array.__len__() - 1
        MAX_HEIGHT = 111 + (start_offset - 15) 

        n_sub = 1
        lg = "none"
        for i in range(2, 2 + group_array.__len__()):
            if(sheet.colinfo_map[i].hidden):
                continue

            group = str(group_array[i - 2])

            if(group != lg):
                n_sub = 1
            else:
                n_sub += 1

            lg = group
            subgroup = str(n_sub)

            print("------------- " + group + " " + "(" +subgroup + ")" + "-------------\n")

            for j in range(start_offset, 111 + (start_offset - 15)):
                res = block(i,j)
                if (j - start_offset) % 16 == 0:
                    print("\n::" + day_array[int((j - start_offset) / 16)] +"::\n")
                    day = day_array[int((j - start_offset) / 16)]
                if not (res == "" or res == " "):            
                    print("%" + time_array[(int((j - start_offset) / 2) % 8)] + "%" + week_array[int(j - start_offset) % 2] )
                    time = time_array[(int((j - start_offset) / 2) % 8)]
                    week = week_array[int(j - start_offset) % 2]
                    content = res
                    print(res)
                    obj = {
                        "time" : time,
                        "week" : week,
                        "day" : day,
                        "group" : group,
                        "subgroup" : subgroup,
                        "content" : content
                    }
                    time_table.append(obj)
                log.write("(" + str(i) + " ; " + str(j) + ")\n")

        log.write('FINISHED!!!!')
        with open(sys.argv[2], "w",  encoding='utf8') as wf:
            json.dump(time_table, wf, ensure_ascii=False)

    except Exception as e:
        log.write(str(e) + '\n')

        

        
        
        