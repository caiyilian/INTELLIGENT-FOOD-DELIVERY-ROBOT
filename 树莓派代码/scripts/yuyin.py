#! /usr/bin/env python
# -*- coding: UTF-8 -*-
import serial,struct,rospy
from std_msgs.msg import String

ser = serial.Serial('/dev/ttyAMA2', 9600)



if __name__ == "__main__":
    
    rospy.init_node("yuyin")
    pub = rospy.Publisher("getPoint",String,queue_size=10)
    while True:
        receive = ser.read()
        pub.publish(str(ord(receive)))
        