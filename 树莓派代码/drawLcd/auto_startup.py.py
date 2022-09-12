import serial,os,sys

ser = serial.Serial('/dev/ttyAMA1', 115200)
drawPath = "/home/ubuntu/my_ws/src/test_odom_rap/drawLcd/drawLcd.py"
byte_list = [0x55, 0x0E, 0x01, 0x02,
                    int(0 / 256), int(0 % 256),
                   0,0,
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
try:
    if ord(ser.read())==85:
        flag = False
        receive = [ord(ser.read()) for i  in range(13)]
        bettery = int(27.322*((receive[9] * 256 + receive[10]) /100.0) - 245.9)
        print(bettery)
        if bettery <0:
            bettery = 0
        elif bettery>100:
            bettery = 100
        try:
            print(bettery)
            os.popen("python "+" "+drawPath+" "+str(bettery)+" 0 0")
        except IOError:
            res = os.system("sudo chmod 777 /dev/i2c-1&sudo chown root.gpio /dev/gpiomem&sudo chmod g+rw /dev/gpiomem&sudo chmod 777 /dev/spidev0.*")
            os.popen("python "+" "+drawPath+" "+str(bettery)+" 0 0")
except TypeError:
    print('error')
