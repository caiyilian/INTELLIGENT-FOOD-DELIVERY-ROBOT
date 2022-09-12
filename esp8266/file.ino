#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <FS.h>  
#include <string.h>
#include <string>
// 设置wifi接入信息(请根据您的WiFi信息进行修改)
const char* ssid = "tomoya";
const char* password = "12345678";
//设置服务器地址
const char* mqttServer = "bemfa.com";
//设置每个文件的地址
#define ShopListTxt "/miniProgram/ShopList.txt" //所有店铺列表，里面存储所有店铺，类型是对象
#define myShopTxt "/miniProgram/myShop.txt" //我创建店铺的列表，里面存储所有店铺，类型是对象，每个键是一个微信用户，值是他的每个店铺的id组成的列表
#define favoriteShopTxt "/miniProgram/favoriteShop.txt" //我收藏的店铺列表，里面存储所有店铺，类型是对象,每个键是一个微信用户，值是他收藏的每个店铺的id组成的列表

//这三个用于存储三个文件的文件名
String ShopListStr;
String myShopStr;
String favoriteShopStr;
String NowShopListStr;//该字符串的值就是当前文件里面的值，上面三个中间变量
String NowMyShopStr;//该字符串的值就是当前文件里面的值
String NowFavoriteShopStr;//该字符串的值就是当前文件里面的值
//设置话题
//用宏定义定义每个主题，因为主题名字不宜太长，所以不好用对应的字符串,前面六个是订阅用的，后面三个是发布用的，看名字就知道有什么用
#define WechatNeedShopList "0"
#define WechatNeedMyShopList "1"
#define WechatNeedFavoriteShopList "2"
#define WechatUpdateShopList "3"
#define WechatUpdateMyShopList "4"
#define WechatUpdateFavoriteShopList "5"
#define EspSendShopList "6"
#define EspSendMyShopList "7"
#define EspSendFavoriteShopList "8"
#define WechatNeedSlamMapUrl "9"
#define EspSendSlamMapUrl "a"
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
//用于判断是否正在读取
bool isreadingShopList = false;
bool isreadingMyShopList = false;
bool isreadingFavoriteShopList = false;
void setup() {
  
  Serial.begin(9600);
  //设置ESP8266工作模式为无线终端模式
  WiFi.mode(WIFI_STA);
    // 连接WiFi
  connectWifi();

  // 设置MQTT服务器和端口号
  mqttClient.setServer(mqttServer, 9501);
 //设置收到消息后的回调函数
  mqttClient.setCallback(receiveCallback);
  // 连接MQTT服务器
  connectMQTTserver();
  
  if(SPIFFS.begin()){ // 启动闪存文件系统
    Serial.println("SPIFFS Started.");
  } else {
    Serial.println("SPIFFS Failed to Start.");
  }
  //初始化
    writeFile(ShopListTxt,"[]");
    writeFile(myShopTxt,"[]");
    writeFile(favoriteShopTxt,"[]");
  Serial.println("longStr");
  //三个文件的内容
  NowShopListStr = readFile(ShopListTxt);
  NowMyShopStr = readFile(myShopTxt);
  NowFavoriteShopStr = readFile(favoriteShopTxt);
  Serial.println("threeFileContent");
  Serial.println(NowShopListStr);
  Serial.println(NowMyShopStr);
  Serial.println(NowFavoriteShopStr);
}

void loop() {
  if (mqttClient.connected()) { // 如果开发板成功连接服务器
    mqttClient.loop();//保持心跳，这样不会掉线
//    Serial.write(0x09);
  } else {                  // 如果开发板未能成功连接服务器
    connectMQTTserver();    // 则尝试连接服务器
  }
}

//读取文件内容
String readFile(String fileName){
  File dataFile = SPIFFS.open(fileName, "r");// 建立File对象用于向SPIFFS中的file对象（即/notes.txt）写入信息
  String content = "";
  for(int i=0; i<dataFile.size(); i++){
    content += (char)dataFile.read();      
  }
  dataFile.close();
  return content;
}
//完全覆盖的写入
void writeFile(String fileName,String content){
  Serial.print("writeDown");
  Serial.println(content);
  Serial.println("to FILE");
  Serial.println(fileName);
  File dataFile = SPIFFS.open(fileName, "w");// 建立File对象用于向SPIFFS中的file对象（即/notes.txt）写入信息
  dataFile.println(content);
  dataFile.close();
}

// 连接MQTT服务器并订阅信息
void connectMQTTserver(){
  // 这个是你的uid
  String clientId = "0c90e6e868154d44b6b3df9e90b24543";

  // 连接MQTT服务器
  if (mqttClient.connect(clientId.c_str())) { 
    Serial.println("MQTT Server Connected.");
    Serial.println("Server Address:");
    Serial.println(mqttServer);
    Serial.println("ClientId: ");
    Serial.println(clientId);
    // 订阅指定主题
    subscribeTopic(WechatNeedShopList); 
    subscribeTopic(WechatNeedMyShopList); 
    subscribeTopic(WechatNeedFavoriteShopList); 
    subscribeTopic(WechatUpdateShopList); 
    subscribeTopic(WechatUpdateMyShopList); 
    subscribeTopic(WechatUpdateFavoriteShopList); 
  } else {
    Serial.print("MQTT Server Connect Failed. Client State:");
    Serial.println(mqttClient.state());
    delay(5000);
  }   
}
 
// 发布信息,传入要发布的话题和发布的内容
void pubMQTTmsg(String pubTopic,String Content){
  //要把字符串转成字符数组才行
  char publishTopic[pubTopic.length() + 1];  
  strcpy(publishTopic, pubTopic.c_str());
  int batchNum = ceil(Content.length()/248.0);//把字符串分成多少份
  int startIndex = 0;//起始索引
  //发送起始标志
  String startFlag = "beginSend";//起始标志
  String endFlag = "endSend";//结束标志
  char StartMsg[startFlag.length()+1];   //把字符串转成字符数组
  strcpy(StartMsg, startFlag.c_str()); 
  mqttClient.publish(publishTopic, StartMsg);//发送
  
  for(int i=0;i<batchNum-1;i++){
    String childStr = Content.substring(startIndex,startIndex+248); //本次发送的子串
    char publishMsg[childStr.length() + 1];   //把字符串转成字符数组
    strcpy(publishMsg, childStr.c_str()); 
    mqttClient.publish(publishTopic, publishMsg);//发送
    startIndex += 248;
  }
  //最后还有一小段消息要发送
  String lastStr = Content.substring(startIndex,Content.length()); //本次发送的子串
  char lastMsg[lastStr.length() + 1];   //把字符串转成字符数组
  strcpy(lastMsg, lastStr.c_str()); 
  mqttClient.publish(publishTopic, lastMsg);//发送
  //发送结束标志
  char EndMsg[endFlag.length()+1];   //把字符串转成字符数组
  strcpy(EndMsg, endFlag.c_str()); 
  mqttClient.publish(publishTopic, EndMsg);//发送
  
  
  // 打印出发送的总内容
  Serial.println("Publish Topic:");Serial.println(publishTopic);
  Serial.println("Publish message:");Serial.println(Content);
}
 
// ESP8266连接wifi
void connectWifi(){
 
  WiFi.begin(ssid, password);
 
  //等待WiFi连接,成功连接后输出成功信息
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi Connected!");  
  Serial.println(""); 
}
// 收到信息后的回调函数
void receiveCallback(char* topic, byte* payload, unsigned int length) {
  //收到的话题
  Serial.print(topic);
  String content = "";
  for (int i = 0; i < length; i++) {
    content += (char)payload[i];
  }
  Serial.println("receive=");
  Serial.print(content);
  Serial.println("");
  if(isSameStr(topic,WechatNeedShopList))  {
    Serial.println("sendTopic");
    Serial.println(EspSendShopList);
    Serial.println("sendMsg");
    Serial.println(NowShopListStr);
    pubMQTTmsg(EspSendShopList,NowShopListStr);
  }
    
  else if(isSameStr(topic,WechatNeedMyShopList)){
    Serial.println("sendTopic");
    Serial.println(EspSendMyShopList);
    Serial.println("sendMsg");
    Serial.println(NowMyShopStr);
    pubMQTTmsg(EspSendMyShopList,NowMyShopStr);
  }
  else if(isSameStr(topic,WechatNeedFavoriteShopList)){
    Serial.println("sendTopic");
    Serial.println(EspSendFavoriteShopList);
    Serial.println("sendMsg");
    Serial.println(NowFavoriteShopStr);
    pubMQTTmsg(EspSendFavoriteShopList,NowFavoriteShopStr);
  }
  else if(isSameStr(topic,WechatUpdateShopList)){
    //发现起始标志，开始读取
    if(content=="beginSend"){
      isreadingShopList = true;//设置开始读取
      ShopListStr = "";//清空ShopListStr
    }
    else if(content=="endSend"){
      NowShopListStr = ShopListStr;
      writeFile(ShopListTxt,ShopListStr);//写进去
      isreadingShopList = false;//停止读取
    }
    else if(isreadingShopList==true){
      ShopListStr += content;
    }
    
  }
  else if(isSameStr(topic,WechatUpdateMyShopList)) {
        //发现起始标志，开始读取
    if(content=="beginSend"){
      isreadingMyShopList = true;//设置开始读取
      myShopStr = "";//myShopStr
    }
    else if(content=="endSend"){
      NowMyShopStr = myShopStr;
      writeFile(myShopTxt,myShopStr);//写进去
      isreadingMyShopList = false;//停止读取
    }
    else if(isreadingMyShopList==true){
      myShopStr += content;
    }
  }
  else if(isSameStr(topic,WechatUpdateFavoriteShopList))  {
       //发现起始标志，开始读取
    if(content=="beginSend"){
      isreadingFavoriteShopList = true;//设置开始读取
      favoriteShopStr = "";//favoriteShopStr
    }
    else if(content=="endSend"){
      NowFavoriteShopStr = favoriteShopStr;
      writeFile(favoriteShopTxt,favoriteShopStr);//写进去
      isreadingFavoriteShopList = false;//停止读取
    }
    else if(isreadingFavoriteShopList==true){
      favoriteShopStr += content;
    }
  }
  else if(isSameStr(topic,EspSendSlamMapUrl)){
    //串口发送数据给树莓派
    Serial.write(0x00); 
    delay(10); //延迟10毫秒，防止发送过频繁
    Serial.write(0x01);
  }
  
}
bool isSameStr(char* Str1,char* Str2){
  int lengStr1 = strlen(Str1);
  int lengStr2 = strlen(Str2);
  if(lengStr1!=lengStr2) return false;
  for(int i=0;i<lengStr1;i++){
    if(Str1[i]!=Str2[i]) return false;
  }
  return true;
}
// 订阅指定主题
void subscribeTopic(String topic){
  
  String topicString = topic;
  char subTopic[topicString.length() + 1];  
  strcpy(subTopic, topicString.c_str());
  
  // 通过串口监视器输出是否成功订阅主题1以及订阅的主题1名称
  if(mqttClient.subscribe(subTopic)){
    Serial.println("Subscrib Topic:");
    Serial.println(subTopic);
  } else {
    Serial.print("Subscribe Fail...");
  }  

}
