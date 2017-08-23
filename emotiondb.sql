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