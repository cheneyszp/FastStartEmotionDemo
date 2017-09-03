# Azure Quick Start 1# Epcisode: Know-You
Cognitive Service Face API+ Emotion API and Azure SQL Database and PowerBI 

## 环境准备
- 注册Azure账号（[1元试用账号申请](https://www.azure.cn/pricing/1rmb-trial-full/)）
- 安装Visual Studio Code（[下载](https://code.visualstudio.com/Download)）（用于调试代码）
- 安装Git（[下载](https://git-scm.com/downloads)） （用于部署应用）

## 创建认知服务API

本例使用Azure认知服务中的人脸识别API以及情绪识别的API。需要创建两个认知服务，获得这两个服务的key。

1. 使用Azure账号登陆[Azure门户](http://portal.azure.cn)
2. 登陆后， 选择新建->Data+Analytics-> 认知服务APIs

![创建认知服务-1](/images/cog1.jpg)

3. 设置账户名称，API类型（人脸API）以及定价层，点击创建即可。
4. 创建成功后，可以在所有资源列表中看到刚刚创建的faceapi,点击进入到概述界面。

![创建认知服务-2](/images/cog2.jpg)

5. 点击“密钥”，可以看到有两个密钥，记下其中一个。

![创建认知服务-3](/images/cog3.jpg)

6. 回到Azure Portal的首页， 选择新建->Data+Analytics-> 认知服务APIs

![创建认知服务-4](/images/cog4.jpg)

7. 设置账户名称，API类型（情绪API）以及定价层，点击创建即可。
8. 创建成功后，可以在所有资源列表中看到刚刚创建的emotionapi,点击进入到概述界面。

![创建认知服务-5](/images/cog5.jpg)

9. 点击“密钥”，可以看到有两个密钥，记下其中一个。


![创建认知服务-6](/images/cog6.jpg)

## 创建Web应用

本例使用Azure Web App来承载网站内容，网站内容使用Node.js来编写。
1. 使用Azure账号登陆[Azure门户](http://portal.azure.cn)
2. 登陆后， 选择新建->Web+Mobile-> Web应用

![创建Web应用-1](/images/webapp1.jpg)

3. 设置相应的应用名称、资源组以及应用计划，点击创建。
4. Web应用创建成功后，可以在资源列表中看到刚刚创建的"ocpemtion"，点击进入Web App概述页，其中URL为你的Web应用的地址。

![创建Web应用-2](/images/webapp2.jpg)

5. 点击部署凭据，设置用户名和密码。这个作为FTP或者GIT的部署凭据，请牢记用户名密码 😊


![创建Web应用-3](/images/webapp3.jpg)

6. 点击部署选项，选择部署源。Web应用可以通过多种方式部署，比较流行的做法是通过Git来部署，本示例将演示通过Git来部署你的Node.js应用。设置部署源为“本地Git存储库”。

![创建Web应用-4](/images/webapp4.jpg)

7. 点击确定即可。

![创建Web应用-5](/images/webapp5.jpg)


8. 回到应用服务的概述中，可以看到Git克隆url

![创建Web应用-6](/images/webapp6.jpg)



## 创建数据库

本例中使用SQL DB保存访问过该网站的用户记录， 主要包括照片识别的结果信息：性别，年龄，表情。本节描述完整的数据库部署过程。

注：本例不保存任何用户照片，阅后即焚。

1. 使用Azure账号登陆[Azure门户](http://portal.azure.cn)
2. 登陆后， 选择新建->DataBase->SQL数据库

![创建数据库-1](/images/db1.PNG)

3. 输入数据库配置信息包括：

    - 数据库名： emotiondb
    - 资源组：选择在创建web site时已经创建的test资源组
    - 服务器名称：创建一个新的服务器，输入服务器名称emotion
    - 数据库管理员：sqldb
    - 密码：xxxxxxx
    - 确认密码：xxxxxxx
    - 位置：中国北部

输入完成后，选择确认，创建。

![创建数据库-2](/images/db2.PNG)

4. 数据库和服务器创建成功后，可以在资源列表中看到，点击“emotiondb”，进入数据库详情页：

![创建数据库-3](/images/db3.PNG)

5. 点击数据库服务器（在服务器名称下），记录数据库服务器名称，这里是“nr8ver0mqe.database.chinacloudapi.cn”，后面在建立数据库连接时使用。

![创建数据库-4](/images/db4.PNG)

6. 配置数据库客户端访问授权，进入数据服务器详情页后，选择设置->防火墙，将当前客户端（即安装了SQL Server Management Studio的客户端）IP加入授权访问列表，并确保允许访问Azure服务选项打开。

![创建数据库-5](/images/db5.PNG)

7. 打开数据库的概览页，点击“工具”

![创建数据库-6](/images/db6.jpg)

8. 可以使用查询编辑器来创建数据库，点击“查询编辑器”，并登录到数据库

![创建数据库-7](/images/db7.jpg)

9. 成功登录之后，将以下代码粘贴到编辑器中，点击执行，完成emotionlist表创建。

```SQL
--Clean the DataBase
IF EXISTS(SELECT * FROM sysobjects WHERE name='emotionlist')
  DROP TABLE emotionlist

--Create Table
--Emotion Access List Table
go
CREATE TABLE emotionlist(
	gender nvarchar(30) Not Null ,
	age varchar(30) Not Null,
	emotion	nvarchar(30) Not Null,
	faceid varchar(100) Not Null,
	time datetime Not Null,
);
CREATE CLUSTERED INDEX EmotionlistIndex ON emotionlist (time ASC); 
go

```

![创建数据库-8](/images/db8.jpg)


## 配置Node.js程序

本例使用Node.js作为后端程序，使用EJS作为模板语言。

1. 请从从本仓库clone或者直接下载到本地。

![node.js-1](/images/nodecode1.jpg)


2. 使用Visual Studio Code打开文件夹“FastStartEmotionDemo-master ”，,编辑/models/emotiondata.js

```Javascript
// Create connection to database
var config = 
   {
     userName: '配置为你的数据库用户名', // update me
     password: '配置为你的数据库用密码', // update me
     server: '你的数据库服务器.database.chinacloudapi.cn', // update me
     options: 
        {
           database: '你创建的数据库名字' //update me
           , encrypt: true
        }
   }

```

3. 使用Visual Studio Code打开文件夹“FastStartEmotionDemo-master ”，编辑其中的/public/javascripts/main.js，将划线部分内容分别替换为创建认知API的步骤5和步骤9的任意一个Key。

```Javascript
var YOUR_FACE_API_KEY = "配置为你创建的认知服务人脸识别API的key";
var YOUR_EMOTION_API_KEY = "配置为你创建的认知服务情绪识别API的key";
```

## 部署Node.js程序

1. 下载下来的代码解压出来。

![Git上传部署到Web App-1](/images/git1.jpg)

2.在解压出来的根目录中创建本地的仓库。首先打开Windows Powershell或者打开cmd,然后cd到当前目录即可。

![Git上传部署到Web App-2](/images/git2.jpg)

输入创建本地仓库的命令：

```
git init
```

![Git上传部署到Web App-3](/images/git3.jpg)

2. 提交内容到本地仓库中

```
git add -A
git commit -m "Initial commit"
```
![Git上传部署到Web App-4](/images/git4.jpg)

![Git上传部署到Web App-5](/images/git5.jpg)

3. 添加Azure的远程Git仓库地址

```
git remote add azuregit 你的远程仓库链接地址（见创建Web应用的步骤8）
```

![Git上传部署到Web App-6](/images/git6.jpg)

4. 将本地仓库推送到远程仓库部署

```
 git push azuregit master
```
推送之后，第一次需要你输入当时在Azure Web App里面填写的部署凭据。妥善保存的用户名密码在这里用上了。
![Git上传部署到Web App-7](/images/git7.jpg)

填写之后就开始推送到远端部署了。

![Git上传部署到Web App-8](/images/git8.jpg)

大功告成！

![Git上传部署到Web App-9](/images/git9.jpg)

这样你的Node.js网站已经部署完毕，您可以访问您创建的Web应用概览里显示的URL，开始使用您自己创建的情绪识别小应用了。

![Git上传部署到Web App-10](/images/website.jpg)