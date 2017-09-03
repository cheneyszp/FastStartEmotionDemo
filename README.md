# Azure Quick Start 1# Epcisode: Know-You
Cognitive Service Face API+ Emotion API with VM deployment. 

## 认识Azure
微软在全球42个区域，打造了上百个数据中心，为客户提供Azure服务。Azure是一个不断增长的集成云服务集合，助您加快发展步伐，提高工作效率，节省运营成本。

[https://www.azure.cn/home/features/what-is-azure/](https://www.azure.cn/home/features/what-is-azure/)

- Microsoft Azure 官网：  https://www.azure.com
- Microsoft Azure 管理门户： https://portal.azure.com

- 由世纪互联运营的Microsoft Azure官网：https://www.azure.cn/
- 由世纪互联运营的Microsoft Azure管理门户：https://portal.azure.cn

- Azure School: https://school.azure.cn/

微软智能云Azure为用户提供了业界领先的人工智能（AI）服务，基于Azure服务可以亲手快速搭建一个懂你的AI应用，希望这个小应用让你今天开心！

## 今天你开心吗
基于微软智能云Azure亲手搭建和体验人脸情绪识别示例。

![程序效果-1](/images/emotion1.jpg)

如何获得Azure测试账号？

https://www.azure.cn/pricing/1rmb-trial-full/

## 部署步骤
- 注册Azure账号（[1元试用账号申请](https://www.azure.cn/pricing/1rmb-trial-full/)）
- 创建认知服务API 
- 创建VM（Ubuntu Server 16.04LTS）
- 部署应用（Node.js + Git）

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

## 创建VM（Ubuntu Server 16.04LTS）

本教程使用Azure的Ubuntu虚拟机来承载网站内容，网站内容使用Node.js来编写。如试用Azure Web App来承载网站内容，可以参考[Web App的部署教程](/GuideWithWebAppDeploymentAndSQL.md)。

1. 使用Azure账号登陆[Azure门户](http://portal.azure.cn)
2. 登陆后， 选择新建->虚拟机，选择Ubuntu Server 16.04 LTS

![创建虚拟机-1](/images/vm1.jpg)

3. 指定虚拟机名称等，用户名： user01 密码: MSLoveLinux!

![创建虚拟机-2](/images/vm2.jpg)
![创建虚拟机-3](/images/vm3.jpg)

4. 配置可选功能，使用默认选项

![创建虚拟机-4](/images/vm4.jpg)
![创建虚拟机-5](/images/vm5.jpg)

5. 创建完毕后，记录虚拟机公共IP地址。

![创建虚拟机-6](/images/vm6.jpg)

6. 调整虚拟机网络安全组，添加入站访问安全规则，打开80端口

![创建虚拟机-7](/images/vm7.jpg)
![创建虚拟机-8](/images/vm8.jpg)
![创建虚拟机-9](/images/vm9.jpg)

## 部署应用

ssh 远程连接到虚拟机

1. 使用putty， 下载[putty](http://www.putty.org/)

2. 或者Linux ssh命令行等其它工具

![部署应用-1](/images/deploy1.jpg)
![部署应用-2](/images/deploy2.jpg)

运行如下脚本安装部署应用：
```
user01@vm-myvm01:~$ sudo apt-get update
user01@vm-myvm01:~$ sudo apt-get install nodejs
user01@vm-myvm01:~$ sudo apt-get install npm
user01@vm-myvm01:~$ git init
user01@vm-myvm01:~$ git clone https://github.com/cheneyszp/FastStartEmotionDemo.git

user01@vm-myvm01:~$ vi /home/user01/FastStartEmotionDemo/public/javascripts/main.js

user01@vm-myvm01:~$ cd /home/user01/FastStartEmotionDemo/
user01@vm-myvm01:~/FastStartEmotionDemo$ nohup sudo npm start &

```

部署完毕，请用手机浏览器访问 http://YOURIP，请一定要转发到微信群中分享哦！

今天你开心吗？


## 参考文档
1.	Azure解决方案：https://azure.microsoft.com/zh-cn/solutions/
2.	Azure用户手册：https://docs.azure.cn/zh-cn/articles/azure-Iaas-user-manual-part1
3.	Azure开发人员指南：https://azure.microsoft.com/zh-cn/campaigns/developer-guide/
4.	Azure常用操作指南 - 技术支持常见问题与解答：https://docs.azure.cn/zh-cn/articles/
5.	Azure常见问题：https://www.azure.cn/support/faq/
