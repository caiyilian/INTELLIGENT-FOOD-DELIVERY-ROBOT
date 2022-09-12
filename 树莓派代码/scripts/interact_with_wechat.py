#! /usr/bin/env python
# -*- coding: UTF-8 -*-
import paho.mqtt.client as mqtt
import os,sys,json
import rospy
from move_base_msgs.msg import MoveBaseActionGoal
from  std_msgs.msg import String 
test_odom_rap_path =sys.argv[0].split("scripts")[0] #/home/ubuntu/my_ws/src/test_odom_rap/
mapPath = test_odom_rap_path+"map"
HOST = "bemfa.com"
PORT = 9501
client_id = "0c90e6e868154d44b6b3df9e90b24543"
goal = MoveBaseActionGoal()
#连接并订阅
def on_connect(client, userdata, flags, rc):
    print("Connected with result code "+str(rc))
    client.subscribe("9")         # 小程序想要获取地图
    client.subscribe("b")         # 小程序发送坐标点（换算过后的，可以直接goal发送出去）  
    client.subscribe("d")          #kitchen Point
#消息接收
def on_message(client, userdata, msg):
    if msg.topic=='9':
        # 小程序想要获取地图
        shopId = str(msg.payload.decode('utf-8'))
        os.system("python3 "+mapPath+"/convert_meter2Pix.py "+shopId)
        url = open(mapPath+"/url.txt",'r').read()
        client.publish("a",url)

    elif msg.topic=='b':
        
        Dict = json.loads(str(msg.payload.decode('utf-8')))
        global goal
        goal.header.stamp = rospy.Time.now()
        goal.goal.target_pose.header.frame_id = 'map'
        goal.goal.target_pose.header.stamp = rospy.Time.now()
        goal.goal.target_pose.pose.position.x = Dict['x']
        goal.goal.target_pose.pose.position.y = Dict['y']
        goal.goal.target_pose.pose.orientation.w = 1
        # goal.
        pub.publish(goal)
    
    elif msg.topic=='d':
        Dict = json.loads(str(msg.payload.decode('utf-8')))
        rospy.loginfo(Dict['x'])
        rospy.loginfo(Dict['y'])
        global goal
        goal.header.stamp = rospy.Time.now()
        goal.goal.target_pose.header.frame_id = 'map'
        goal.goal.target_pose.header.stamp = rospy.Time.now()
        goal.goal.target_pose.pose.position.x = float(Dict['x'])
        goal.goal.target_pose.pose.position.y = float(Dict['y'])
        goal.goal.target_pose.pose.orientation.w = 1
        pub.publish(goal)
        # 将得到的坐标点直接发送出去，话题是/move_base/goal
    # print("主题:"+msg.topic+" 消息:"+str(msg.payload.decode('utf-8')))

#订阅成功
def on_subscribe(client, userdata, mid, granted_qos):
    print("On Subscribed: qos = %d" % granted_qos)

# 失去连接
def on_disconnect(client, userdata, rc):
    if rc != 0:
        print("Unexpected disconnection %s" % rc)
def getPoint(msg):
    client.publish('c',msg.data)
client = mqtt.Client(client_id)
client.username_pw_set("userName", "passwd")
client.on_connect = on_connect
client.on_message = on_message
client.on_subscribe = on_subscribe
client.on_disconnect = on_disconnect
client.connect(HOST, PORT, 60)

if __name__ == "__main__":
    

    rospy.init_node("interact_with_wechat")
    client.loop_start()
    pub = rospy.Publisher("/move_base/goal",MoveBaseActionGoal,queue_size=10)
    sub1 = rospy.Subscriber("getPoint",String,getPoint,queue_size=1000)
    rospy.spin()