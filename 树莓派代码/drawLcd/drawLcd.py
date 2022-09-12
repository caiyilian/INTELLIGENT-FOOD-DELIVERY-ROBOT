# -*- coding: utf-8 -*-
#!/usr/local/bin/python3



import sys,os
from PIL import Image, ImageDraw, ImageFont  
try:
    from lcd import LCD_2inch4
except IOError:
    res = os.system("sudo chmod 777 /dev/i2c-1&sudo chown root.gpio /dev/gpiomem&sudo chmod g+rw /dev/gpiomem&sudo chmod 777 /dev/spidev0.*")
    from lcd import LCD_2inch4

battery = sys.argv[1]   # %
forward_speed =str(round(100*float(sys.argv[2]),1)) #cm/s
angular_speed = str(round(float(sys.argv[3]),2))  #rad/s
#battery = '100'
#forward_speed = '10.0'
#angular_speed = '1.57'

# font_path = "/home/ubuntu/my_ws/src/test_odom_rap/drawLcd/fonts/"
font_path = sys.argv[0].replace("drawLcd.py","fonts/")
disp = LCD_2inch4.LCD_2inch4()
disp.Init()


def screen_display(battery,forward_speed,angular_speed, background_color='white', font_color='blue', font_size=25, a=40, b=30):

    msgs = ["battery: "+battery+"%","FVel: "+forward_speed+"cm/s","angVel: "+angular_speed+"rad/s"]

    disp.clear()

    image1 = Image.new("RGB", (320, 240), background_color)
    draw = ImageDraw.Draw(image1)
    Font = ImageFont.truetype(font_path + "arial.ttf", font_size)


    for i in range(0,5,2):
        font_location0 = (a, b + font_size * i)
        print(msgs[i//2])
        draw.text(font_location0, msgs[i//2], fill=font_color, font=Font)
    image1 = image1.rotate(0)
    disp.ShowImage(image1)


screen_display(battery,forward_speed,angular_speed)



