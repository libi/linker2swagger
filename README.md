# linker2swagger
A eolinker to swagger json converter script *(roughly done)*.

一个将eolinker数据转换为 swagger 的转换器，swagger JSON 格式可以方便的导入 Yapi,Postman 等其他工具内。
## Useless crap

Eolinker is a great API management software, please don't misunderstanding this as any sort of bad tended script against this greate tool. (You don't have read the next few lines)


But as for my scene, Eolinker is a bit too much. Whether the cost or the function.
So when I'm trying to export my data out of eolinker, the only format available is their own format(which is json) or documents.

Firstly, I'm grateful that they did opensource their early version of software, and due to whatever reason they decide to pull their code off from every git platform, and I respect their decision. 
But I think it is important to give people like me a chance to pull our data out of their platform. Obviously they can make their own format into binary stuff and they don't. I'm appreciated.
Before doing this I haven't do the research that if anyone have done this before. Because this is just for my personal use, so it's badly done, so many flaws inside. So if there is a better one please tell me to delete this repo, or if it has none, please help me make this script better.

This is the first year of my coder career, and this is the first repo I upload after I got my work. So any suggestion is appreciated. ❤️

# How to use

put your eolink file into the ```eo-in``` folder, make sure you have already delete the placeholder file from both input and output folder, and execute ```node index.js```, then VOILA, the swagger file just popup in the ```sw-out``` folder.

Notice, the generated file will keep the identically name as the source file, again, roughly done. so if you want to import the swagger file into some service, may be change the eolinker export file's name into ```xxx.json``` in the first place.

Hope this helps.
