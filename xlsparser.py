import xlrd
import json

time_array = ["7:30", "9:10", "10:50", "13:00", "14:40", "16:20", "18:00", "19:40"]
day_array = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
week_array = ["UP", "DOWN"]
group_array = []

time_table = []

def is_left_border(i,j):

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
        
        cell = sheet.cell(j,i)
        data += " " + str(cell.value).strip()

        bb = is_bottom_border(i,j) or bb
        bl = is_left_border(i,j) or bl
        br = is_right_border(i,j) or br
        bt = is_top_border(i,j) or bt
    
    return data


wb = xlrd.open_workbook('./data/data.xls', formatting_info=True)
sheet = wb.sheet_by_index(0)

for i in range(2, sheet.ncols - 1, 2):
    group_array.append(sheet.cell(12,i).value)

time = ""
day = ""
week = ""
group = ""
subgroup = ""
content = ""

for i in range(2,sheet.ncols - 3):
    print("------------- " + str(group_array[int(i/2)]) + " " + "(" +str(i % 2 + 1) + ")" + "-------------\n")
    group = str(group_array[int(i/2)])
    subgroup = str(i % 2 + 1)
    for j in range(15, 110):
        res = block(i,j)
        if (j - 15) % 16 == 0:
            print("\n::" + day_array[int((j - 15) / 16)] +"::\n")
            day = day_array[int((j - 15) / 16)]
        if not (res == "" or res == " "):            
            print("%" + time_array[(int((j - 15) / 2) % 8)] + "%" + week_array[int(j - 15) % 2] )
            time = time_array[(int((j - 15) / 2) % 8)]
            week = week_array[int(j - 15) % 2]
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


with open("parsedTimeTable.json", "w",  encoding='utf8') as wf:
    json.dump(time_table, wf, ensure_ascii=False)

        

        
        
        