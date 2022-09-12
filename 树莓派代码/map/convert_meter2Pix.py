import json
import os.path
import sys

from PIL import Image
import requests
import numpy as np
import cv2
mapPath = __file__.replace("convert_meter2Pix.py","")
pgmFile = mapPath+'nav.pgm'
yamlFile = mapPath+"nav.yaml"
saveFile = mapPath+"nav.jpg"
saveTempFile = mapPath+"navTemp.jpg"
shopId = sys.argv[1]
def getOriPoint(pgmFile,yamlFile,saveFile):
    '''
    得到转换后的坐标
    :param pgmFile: pgm文件地址
    :param yamlFile: yaml文件地址
    :param saveFile: 将要保存的文件地址
    :return:  返回原点在过滤后的图片的位置，以及图片是否以及存在了
    '''
    imgObj = Image.open(pgmFile) #得到这个pgm图片对象
    originJPG = np.array(imgObj) #image格式转成numpy格式
    with open(yamlFile, 'r', encoding="utf-8") as f: #得到原始原点和长度像素比
        for line in f.readlines():
            if "resolution" in line:
                resolution = float(line.replace("\n", "").replace(" ", "").split(":")[-1])
            elif "origin" in line:
                origin = json.loads(line.replace("\n", "").replace(" ", "").split(":")[-1])[0:2]
    h, w = originJPG.shape
    x_meter, y_meter = origin #初始原点，单位是米

    x_pix = int(x_meter / resolution) + w #初始原点，单位是像素，下同
    y_pix = - int(y_meter / resolution)

    #开始将地图中无用的大部分地方删掉
    startRow = 0
    endRow = 0
    flag = 0
    for i in range(h):
        if (originJPG[i, :] == 205).all() == False and flag == 0:
            startRow = i
            flag = 1
        if flag == 1 and (originJPG[i, :] == 205).all():
            endRow = i
            break

    startCol = 0
    endCol = 0
    flag = 0
    for i in range(w):
        if (originJPG[:, i] == 205).all() == False and flag == 0:
            startCol = i
            flag = 1
        if flag == 1 and (originJPG[:, i] == 205).all():
            endCol = i
            break

    # print(startRow,startCol,endCol,endRow)
    useImg = originJPG[startRow:endRow, startCol:endCol] #转换后的图片
    oriPoint = (y_pix - startCol, x_pix - startRow) #转换得到过滤后的有用地图的原点位置

    useImgObj = Image.fromarray(useImg)
    useImgObj.save(saveTempFile) #先保存在一个中间变量，后面要判断是否在图床上已存在这个图片
    try:
        if os.path.exists(saveFile) and (np.array(Image.open(saveTempFile))==np.array(Image.open(saveFile))).all():
            #图片已存在，不需要重复上传到图传
            isRepeat = True
            print("图片已存在")
        else:
            isRepeat = False
            useImgObj.save(saveFile)
    except AttributeError:
        isRepeat = False
        useImgObj.save(saveFile)
            
    return oriPoint,isRepeat


(originX,originY),isRepeat = getOriPoint(pgmFile,yamlFile,saveFile)
isRepeat = False
if isRepeat==False:
    url = "https://www.imgtp.com/api/upload" #上传的api
    files = {'image': open(saveFile,"rb")} #图片文件
    token = "1fa8bda0e9c4626e9499a1e6ec68dd26"
    headers = {'token':token }
    res = requests.post(url, files=files, headers=headers).json()
    if res["msg"]=="success":
        netUrl = res['data']['url']
    else:
        print("失败")
        raise Exception("出错了!!")
    lastUrl = netUrl + "?x="+str(int(originX))+"&y="+str(int(originY))+"&id=\""+str(shopId)+'"'
    txtFile = open(mapPath+"url.txt",'w',encoding='utf-8')
    txtFile.write(lastUrl)
else:
    oriUrl = open(mapPath+"url.txt",'r',encoding='utf-8').read()
    oriUrl = oriUrl[:oriUrl.rfind("=")+1]+'"'+shopId+'"'
    open(mapPath+"url.txt",'w',encoding='utf-8').write(oriUrl)
