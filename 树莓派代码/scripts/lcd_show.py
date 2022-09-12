#! /usr/bin/env python
# -*- coding: UTF-8 -*-
import rospy,struct
from geometry_msgs.msg import Twist
import serial,sys,os
ser = serial.Serial('/dev/ttyAMA1', 115200,timeout=0.5,inter_byte_timeout=0.1)
# ser2 = serial.Serial('/dev/ttyAMA2', 9600)
test_odom_rap_path =sys.argv[0].split("scripts")[0] #/home/ubuntu/my_ws/src/test_odom_rap/
drawPath = test_odom_rap_path+"drawLcd/drawLcd.py"
count = 0
isZero = False
noPower = False
def showLcd(data):
    try:
        if ord(ser.read())==85:
            global count
            global isZero
            receive = [ord(ser.read()) for i  in range(13)]
            if sum(receive[3:7])!=0:
                isZero = False    
                count += 1
            elif isZero==False:
                isZero = True    
                count += 1
            else:
                isZero = True
            if count%100==0:
                count = 0
                bettery = int(27.322*((receive[9] * 256 + receive[10]) /100.0) - 245.9)
                # if bettery < 10 and noPower==False:
                #     noPower = True
                #     ser2.write(struct.pack('BBBBBB',0xAA,0x55,0X03,0X0C,0X55,0XAA))
                if bettery <0:
                    bettery = 0
                elif bettery>100:
                    bettery = 100
                try:
                    os.popen("python "+" "+drawPath+" "+str(bettery)+" "+str(data.linear.x)+" "+str(data.angular.z))
                except IOError:
                    res = os.system("sudo chmod 777 /dev/i2c-1&sudo chown root.gpio /dev/gpiomem&sudo chmod g+rw /dev/gpiomem&sudo chmod 777 /dev/spidev0.*")
                    os.popen("python "+" "+drawPath+" "+str(bettery)+" "+str(data.linear.x)+" "+str(data.angular.z))
    except TypeError:
        pass


if __name__ == "__main__":
    

    rospy.init_node("lcd_show")
    sub = rospy.Subscriber("/cmd_vel",Twist,showLcd,queue_size=10)
    rospy.spin()