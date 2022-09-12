#! /usr/bin/env python
# -*- coding: UTF-8 -*-
from time import time
import rospy,struct
from geometry_msgs.msg import Twist
from move_base_msgs.msg import MoveBaseActionResult
from move_base_msgs.msg import MoveBaseActionGoal
from actionlib_msgs.msg import GoalID
import serial
import sys


test_odom_rap_path =sys.argv[0].split("scripts")[0] #/home/ubuntu/my_ws/src/test_odom_rap/
ser = serial.Serial('/dev/ttyAMA1', 115200)
ser2 = serial.Serial('/dev/ttyAMA2', 9600)
mapPath = test_odom_rap_path+"map"
drawPath = test_odom_rap_path+"drawLcd/drawLcd.py"
cancelMsg = GoalID()
msg = Twist()
msg.linear.x = 0
msg.angular.z = 0
count = 0
def doPose(data):
    # 收到cmd_vel话题的时候的执行函数
    v_1 = data.linear.x*11304.54+data.angular.z*866.606
    v_2 = data.linear.x*11304.54-data.angular.z*866.606
    if v_1<0:
        v_1 = 65536+v_1
    if v_2<0:
        v_2 = 65536+v_2
   
    byte_list = [0x55, 0x0E, 0x01, 0x02,
                    int(v_1 / 256), int(v_1 % 256),
                    int(v_2 / 256), int(v_2 % 256),
                    0,0,
                    0, 0, 1]
    k = 0
    for i in range(len(byte_list)):
        k += byte_list[i]
        k = k % 256
    byte_list.append(k)
    contr_law = b"%c%c%c%c%c%c%c%c%c%c%c%c%c%c" % (byte_list[0], byte_list[1], byte_list[2], byte_list[3],
                                                    byte_list[4], byte_list[5], byte_list[6], byte_list[7],
                                                    byte_list[8], byte_list[9], byte_list[10], byte_list[11],
                                                    byte_list[12], byte_list[13])
    
    ser.write(contr_law)
    #rospy.loginfo(sum(byte_list[4:8]))


def arrive(data):
    rospy.loginfo(data)
    ser2.write(struct.pack('BBBBBB',0xAA,0x55,0X02,0X06,0X55,0XAA))
    pub2.publish(cancelMsg)
    global atFinal
    atFinal = True
    while atFinal:
        pub.publish(msg)
        rospy.sleep(0.05)

def begin(data):
    ser2.write(struct.pack('BBBBBB',0xAA,0x55,0X01,0X01,0X55,0XAA))
    global atFinal
    atFinal = False


if __name__ == "__main__":
    

    rospy.init_node("sub_pose_p")
    
    sub = rospy.Subscriber("/cmd_vel",Twist,doPose,queue_size=1000)
    sub1 = rospy.Subscriber("/move_base/result",MoveBaseActionResult,arrive,queue_size=1000)
    sub2 = rospy.Subscriber("/move_base/goal",MoveBaseActionGoal,begin,queue_size=1000)
    pub = rospy.Publisher("/cmd_vel",Twist,queue_size=10)
    pub2 =  rospy.Publisher("/move_base/cancel",GoalID,queue_size=10)
    rospy.spin()
