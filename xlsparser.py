import xlrd
import json
import sys 

start_offset = 15

#sys.argv.append("./data/data0.xls")
#sys.argv.append("test")

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

    cell = sheet.cell(j,i)
    style = wb.xf_list[cell.xf_index]
    b = style.border

    b1 =  b.left_line_style != 0

    cell = sheet.cell(j ,i - 1)
    style = wb.xf_list[cell.xf_index]
    b = style.border

    b2 = b.right_line_style != 0

    return b1 or b2

def is_right_border(i,j):

    if(i == MAX_WIDTH):
        return True

    cell = sheet.cell(j,i)
    style = wb.xf_list[cell.xf_index]
    b = style.border

    b1 =  b.right_line_style != 0

    cell = sheet.cell(j ,i + 1)
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
    if(i == 37 and j == 33):
        v = 10

    #Move left top
    while(not is_left_border(i,j)):
        i += -1
    while(not is_top_border(i,j)):
        j += -1


    data = ""

    cell = sheet.cell(j,i)
    style = wb.xf_list[cell.xf_index]

    if(style.background.pattern_colour_index == 64) :
        return ""
 
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
            data += " " + str(cell.value).strip()

            bb = is_bottom_border(i,j) or bb
            bl = is_left_border(i,j) or bl
            br = is_right_border(i,j) or br
            bt = is_top_border(i,j) or bt
        except Exception:
            return data
    
    return data

with open(sys.argv[2] + ".log", "w",  encoding='utf8') as log:
    try:

        wb = xlrd.open_workbook(sys.argv[1], formatting_info=True)
        sheet = wb.sheet_by_index(0)

        log.write( str(sheet.ncols) + " " + str(sheet.nrows) + "\n")

        for i in range(2, sheet.ncols - 1, 2):
            log.write(str(i) + " <- i\n")
            if(sheet.cell(12,i).value != ""):
                group_array.append(sheet.cell(12,i).value)

        if(group_array.__len__() == 0):
            log.write("REBIND!!!!!\n")
            start_offset = 16
            group_array.clear()
            for i in range(2, sheet.ncols - 1, 2):
                if(sheet.cell(13,i).value != ""):
                    group_array.append(sheet.cell(13,i).value)

        time = ""
        day = ""
        week = ""
        group = ""
        subgroup = ""
        content = ""


        log.write(str(2 + 2 * group_array.__len__()) + " <- final width lenght\n")

        MIN_HEIGHT = start_offset
        MAX_WIDTH = 2 + 2 * group_array.__len__() - 1
        MAX_HEIGHT = 111 + (start_offset - 15) - 1

        for i in range(2, 2 + 2 * group_array.__len__()):
            print("------------- " + str(group_array[int(i/2) - 1]) + " " + "(" +str(i % 2 + 1) + ")" + "-------------\n")

            group = str(group_array[int(i/2)- 1])
            subgroup = str(i % 2 + 1)
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


        with open(sys.argv[2], "w",  encoding='utf8') as wf:
            json.dump(time_table, wf, ensure_ascii=False)

    except Exception as e:
        log.write(str(e) + '\n')

        

        
        
        