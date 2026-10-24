from functools import lru_cache
from math import floor, pi, sin

class LunarDate:
    def __init__(self, day, month, year, leap, jd):
        self.day = day
        self.month = month
        self.year = year
        self.leap = leap
        self.jd = jd
        
TK19 = [
    0x30baa3, 0x56ab50, 0x422ba0, 0x2cab61, 0x52a370, 0x3c51e8, 0x60d160, 0x4ae4b0, 0x376926, 0x58daa0,
    0x445b50, 0x3116d2, 0x562ae0, 0x3ea2e0, 0x28e2d2, 0x4ec950, 0x38d556, 0x5cb520, 0x46b690, 0x325da4,
    0x5855d0, 0x4225d0, 0x2ca5b3, 0x52a2b0, 0x3da8b7, 0x60a950, 0x4ab4a0, 0x35b2a5, 0x5aad50, 0x4455b0,
    0x302b74, 0x562570, 0x4052f9, 0x6452b0, 0x4e6950, 0x386d56, 0x5e5aa0, 0x46ab50, 0x3256d4, 0x584ae0,
    0x42a570, 0x2d4553, 0x50d2a0, 0x3be8a7, 0x60d550, 0x4a5aa0, 0x34ada5, 0x5a95d0, 0x464ae0, 0x2eaab4,
    0x54a4d0, 0x3ed2b8, 0x64b290, 0x4cb550, 0x385757, 0x5e2da0, 0x4895d0, 0x324d75, 0x5849b0, 0x42a4b0,
    0x2da4b3, 0x506a90, 0x3aad98, 0x606b50, 0x4c2b60, 0x359365, 0x5a9370, 0x464970, 0x306964, 0x52e4a0,
    0x3cea6a, 0x62da90, 0x4e5ad0, 0x392ad6, 0x5e2ae0, 0x4892e0, 0x32cad5, 0x56c950, 0x40d4a0, 0x2bd4a3,
    0x50b690, 0x3a57a7, 0x6055b0, 0x4c25d0, 0x3695b5, 0x5a92b0, 0x44a950, 0x2ed954, 0x54b4a0, 0x3cb550,
    0x286b52, 0x4e55b0, 0x3a2776, 0x5e2570, 0x4852b0, 0x32aaa5, 0x56e950, 0x406aa0, 0x2abaa3, 0x50ab50
]

TK20 = [
    0x3c4bd8, 0x624ae0, 0x4ca570, 0x3854d5, 0x5cd260, 0x44d950, 0x315554, 0x5656a0, 0x409ad0, 0x2a55d2,
    0x504ae0, 0x3aa5b6, 0x60a4d0, 0x48d250, 0x33d255, 0x58b540, 0x42d6a0, 0x2cada2, 0x5295b0, 0x3f4977,
    0x644970, 0x4ca4b0, 0x36b4b5, 0x5c6a50, 0x466d50, 0x312b54, 0x562b60, 0x409570, 0x2c52f2, 0x504970,
    0x3a6566, 0x5ed4a0, 0x48ea50, 0x336a95, 0x585ad0, 0x442b60, 0x2f86e3, 0x5292e0, 0x3dc8d7, 0x62c950,
    0x4cd4a0, 0x35d8a6, 0x5ab550, 0x4656a0, 0x31a5b4, 0x5625d0, 0x4092d0, 0x2ad2b2, 0x50a950, 0x38b557,
    0x5e6ca0, 0x48b550, 0x355355, 0x584da0, 0x42a5b0, 0x2f4573, 0x5452b0, 0x3ca9a8, 0x60e950, 0x4c6aa0,
    0x36aea6, 0x5aab50, 0x464b60, 0x30aae4, 0x56a570, 0x405260, 0x28f263, 0x4ed940, 0x38db47, 0x5cd6a0,
    0x4896d0, 0x344dd5, 0x5a4ad0, 0x42a4d0, 0x2cd4b4, 0x52b250, 0x3cd558, 0x60b540, 0x4ab5a0, 0x3755a6,
    0x5c95b0, 0x4649b0, 0x30a974, 0x56a4b0, 0x40aa50, 0x29aa52, 0x4e6d20, 0x39ad47, 0x5eab60, 0x489370,
    0x344af5, 0x5a4970, 0x4464b0, 0x2c74a3, 0x50ea50, 0x3d6a58, 0x6256a0, 0x4aaad0, 0x3696d5, 0x5c92e0
]

TK21 = [
    0x46c960, 0x2ed954, 0x54d4a0, 0x3eda50, 0x2a7552, 0x4e56a0, 0x38a7a7, 0x5ea5d0, 0x4a92b0, 0x32aab5,
    0x58a950, 0x42b4a0, 0x2cbaa4, 0x50ad50, 0x3c55d9, 0x624ba0, 0x4ca5b0, 0x375176, 0x5c5270, 0x466930,
    0x307934, 0x546aa0, 0x3ead50, 0x2a5b52, 0x504b60, 0x38a6e6, 0x5ea4e0, 0x48d260, 0x32ea65, 0x56d520,
    0x40daa0, 0x2d56a3, 0x5256d0, 0x3c4afb, 0x6249d0, 0x4ca4d0, 0x37d0b6, 0x5ab250, 0x44b520, 0x2edd25,
    0x54b5a0, 0x3e55d0, 0x2a55b2, 0x5049b0, 0x3aa577, 0x5ea4b0, 0x48aa50, 0x33b255, 0x586d20, 0x40ad60,
    0x2d4b63, 0x525370, 0x3e49e8, 0x60c970, 0x4c54b0, 0x3768a6, 0x5ada50, 0x445aa0, 0x2fa6a4, 0x54aad0,
    0x4052e0, 0x28d2e3, 0x4ec950, 0x38d557, 0x5ed4a0, 0x46d950, 0x325d55, 0x5856a0, 0x42a6d0, 0x2c55d4,
    0x5252b0, 0x3ca9b8, 0x62a930, 0x4ab490, 0x34b6a6, 0x5aad50, 0x4655a0, 0x2eab64, 0x54a570, 0x4052b0,
    0x2ab173, 0x4e6930, 0x386b37, 0x5e6aa0, 0x48ad50, 0x332ad5, 0x582b60, 0x42a570, 0x2e52e4, 0x50d160,
    0x3ae958, 0x60d520, 0x4ada90, 0x355aa6, 0x5a56d0, 0x462ae0, 0x30a9d4, 0x54a2d0, 0x3ed150, 0x28e952
]
TK22 = [
    0x4eb520,0x38d727,0x5eada0,0x4a55b0,0x362db5,0x5a45b0,0x44a2b0,0x2eb2b4,0x54a950,0x3cb559,
    0x626b20,0x4cad50,0x385766,0x5c5370,0x484570,0x326574,0x5852b0,0x406950,0x2a7953,0x505aa0,
    0x3baaa7,0x5ea6d0,0x4a4ae0,0x35a2e5,0x5aa550,0x42d2a0,0x2de2a4,0x52d550,0x3e5abb,0x6256a0,
    0x4c96d0,0x3949b6,0x5e4ab0,0x46a8d0,0x30d4b5,0x56b290,0x40b550,0x2a6d52,0x504da0,0x3b9567,
    0x609570,0x4a49b0,0x34a975,0x5a64b0,0x446a90,0x2cba94,0x526b50,0x3e2b60,0x28ab61,0x4c9570,
    0x384ae6,0x5cd160,0x46e4a0,0x2eed25,0x54da90,0x405b50,0x2c36d3,0x502ae0,0x3a93d7,0x6092d0,
    0x4ac950,0x32d556,0x58b4a0,0x42b690,0x2e5d94,0x5255b0,0x3e25fa,0x6425b0,0x4e92b0,0x36aab6,
    0x5c6950,0x4674a0,0x31b2a5,0x54ad50,0x4055a0,0x2aab73,0x522570,0x3a5377,0x6052b0,0x4a6950,
    0x346d56,0x585aa0,0x42ab50,0x2e56d4,0x544ae0,0x3ca570,0x2864d2,0x4cd260,0x36eaa6,0x5ad550,
    0x465aa0,0x30ada5,0x5695d0,0x404ad0,0x2aa9b3,0x50a4d0,0x3ad2b7,0x5eb250,0x48b540,0x33d556
]

CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"]
CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"]
CHI_EMOJI = ["🐭","🐂","🐯","🐱","🐲","🐍","🐴","🐐","🐵","🐔","🐶","🐷"]
THU = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"]
MONTH_NAMES = [
    "Tháng Giêng", "Tháng Hai", "Tháng Ba", "Tháng Tư", "Tháng Năm", "Tháng Sáu",
    "Tháng Bảy", "Tháng Tám", "Tháng Chín", "Tháng Mười", "Tháng Mười Một", "Tháng Chạp"
]

GIO_HD = ["110100101100","001101001011","110011010010","101100110100","001011001101","010010110011"]

TIETKHI = [
    "Xuân Phân","Thanh Minh","Cốc Vũ","Lập Hạ","Tiểu Mãn","Mang Chủng",
    "Hạ Chí","Tiểu Thử","Đại Thử","Lập Thu","Xử Thử","Bạch Lộ",
    "Thu Phân","Hàn lộ","Sương Giáng","Lập đông","Tiểu Tuyết","Đại Tuyết",
    "Đông Chí","Tiểu Hàn","Đại Hàn","Lập Xuân","Vũ Thủy","Kinh Trập"
]

NGAY_LE_DL = {
    "1/1": "Tết Dương lịch", "9/1": "Truyền thống học sinh, sinh viên Việt Nam", "3/2": "Thành lập Đảng Cộng Sản Việt Nam",
    "14/2": "Lễ tình nhân", "27/2": "Thầy thuốc Việt Nam", "8/3": "Quốc tế Phụ nữ", "20/3": "Quốc tế Hạnh phúc",
    "22/3": "Nước sạch Thế giới", "26/3": "Thành lập Đoàn TNCS Hồ Chí Minh", "31/3": "Lễ Phục Sinh", "1/4": "Cá tháng Tư",
    "30/4": "Giải phóng Miền Nam", "1/5": "Quốc tế Lao động", "7/5": "Chiến thắng Điện Biên Phủ", "12/5": "Ngày của Mẹ",
    "19/5": "Ngày sinh Chủ tịch Hồ Chí Minh", "1/6": "Quốc tế Thiếu Nhi", "18/6": "Ngày của Cha", "21/6": "Báo chí Việt Nam",
    "28/6": "Gia đình Việt Nam", "11/7": "Dân số thế giới", "27/7": "Thương binh liệt sĩ", "28/7": "Thành lập công đoàn Việt Nam",
    "19/8": "Kỷ niệm Cách mạng Tháng 8 thành công", "2/9": "Quốc Khánh", "10/9": "Thành lập Mặt trận Tổ quốc Việt Nam",
    "1/10": "Quốc tế người cao tuổi", "10/10": "Ngày giải phóng Thủ Đô", "13/10": "Doanh nhân Việt Nam",
    "16/10": "Ngày Lương thực thế giới", "17/10": "Ngày quốc tế xóa nghèo", "20/10": "Phụ nữ Việt Nam (20.10.1930)",
    "31/10": "Halloween", "9/11": "Pháp luật Việt Nam", "19/11": "Quốc tế Nam giới", "20/11": "Nhà giáo Việt Nam",
    "23/11": "Thành lập Hội chữ thập đỏ Việt Nam", "28/11": "Lễ Tạ Ơn", "29/11": "Black Friday",
    "1/12": "Thế giới phòng chống AIDS", "19/12": "Toàn quốc kháng chiến", "25/12": "Lễ Giáng Sinh",
    "22/12": "Thành lập Quân đội nhân dân Việt Nam"
}

NGAY_LE_AL = {
    "1/1": "Tết Nguyên Đán", "15/1": "Tết Nguyên Tiêu", "3/3": "Tết Hàn Thực, Tiết Thanh Minh",
    "10/3": "Giỗ tổ Hùng Vương", "15/4": "Lễ Phật Đản", "5/5": "Tết Đoan Ngọ", "7/7": "Lễ Thất Tịch",
    "15/7": "Lễ Vu Lan", "15/8": "Tết Trung Thu", "9/9": "Tết Trùng Cửu", "10/10": "Tết Trùng Thập",
    "15/10": "Tết Hạ Nguyên", "23/12": "Ông Táo Về Trời"
}


THAP_NHI_TRUC = {
  "Kiến": { "tot": "Khai trương, nhậm chức, cưới hỏi, trồng cây, đền ơn đáp nghĩa. Xuất hành đặng lợi, sinh con rất tốt.", "xau": "Động thổ, chôn cất, đào giếng, lợp nhà." },
  "Trừ":  { "tot": "Động đất, ban nền đắp nền, thờ cúng Táo Thần, cầu thầy chữa bệnh bằng cách mổ xẻ hay châm cứu, bốc thuốc, xả tang, khởi công làm lò nhuộm lò gốm, nữ nhân khởi đầu uống thuốc chữa bệnh.", "xau": "Đẻ con nhằm ngày này khó nuôi, nên làm Âm Đức cho con, nam nhân kỵ khởi đầu uống thuốc." },
  "Mãn":  { "tot": "Xuất hành, đi đường thủy, cho vay, thu nợ, mua hàng, bán hàng, nhập kho, đặt táng, kê gác, sửa chữa, lắp đặt máy, thuê thêm người, vào học kỹ nghệ, làm chuồng gà ngỗng vịt.", "xau": "Lên quan lãnh chức, uống thuốc, vào làm hành chính, dâng nộp đơn từ." },
  "Bình": { "tot": "Nhập vào kho, đặt táng, gắn cửa, kê gác, đặt yên chỗ máy, sửa chữa làm tàu, khai trương tàu thuyền, các việc bồi đắp thêm ( như bồi bùn, đắp đất, lót đá, xây bờ kè.) Lót giường đóng giường, thừa kế tước phong hay thừa kế sự nghiệp, các vụ làm cho khuyết thủng ( như đào mương, móc giếng, xả nước.)", "xau": "Không có" },
  "Định": { "tot": "Động thổ, san nền, đắp nền, làm hay sửa phòng bếp, lắp đặt máy móc, nhập học, làm lễ cầu thân, nộp đơn dâng sớ, sửa hay làm tàu thuyền, khai trương tàu thuyền, khởi công làm lò. Mua nuôi thêm súc vật.", "xau": "Thưa kiện, xuất hành đi xa." },
  "Chấp": { "tot": "Lập khế ước, giao dịch, động thổ san nền, cầu thầy chữa bệnh, đi săn thú cá, tìm bắt trộm cướp. Xây đắp nền-tường.", "xau": "Dời nhà, đi chơi xa, mở cửa hiệu buôn bán, xuất tiền của." },
  "Phá":  { "tot": "Trị bệnh, Phá dỡ, Dọn dẹp", "xau": "Là ngày Nhật Nguyệt tương xung. Ngày có trực Phá muôn việc làm vào ngày này đều bất lợi." },
  "Nguy":  { "tot": "Không nên làm gì", "xau": "Nói đến Trực Nguy là nói đến sự Nguy hiểm, suy thoái. Chính vì thế ngày có trực Nguy là ngày xấu, tiến hành muôn việc đều hung." },
  "Thành":{ "tot": "Lập khế ước, giao dịch, cho vay, thu nợ, mua hàng, bán hàng, xuất hành, đi tàu thuyền, khởi tạo, động thổ, san nền đắp nền, gắn cửa, đặt táng, kê gác, dựng xây kho vựa, làm hay sửa chữa phòng bếp, thờ phụng Táo Thần, lắp đặt máy móc ( hay các loại máy ), gặt lúa, đào ao giếng, tháo nước, cầu thầy chữa bệnh, mua gia súc, các việc trong vụ chăn nuôi, nhập học, làm lễ cầu thân, cưới gả, kết hôn, thuê người, nộp đơn dâng sớ, học kỹ nghệ, làm hoặc sửa tàu thuyền, khai trương tàu thuyền, vẽ tranh, tu sửa cây cối.", "xau": "Kiện tụng, tranh chấp." },
  "Thu":  { "tot": "Cấy lúa, gặt lúa, mua trâu, nuôi tằm, đi săn thú cá, tu sửa cây cối. Động thổ, san nền đắp nền, nữ nhân khởi ngày uống thuốc chưa bệnh, lên quan lãnh chức, thừa kế chức tước hay sự nghiệp, vào làm hành chính, nộp đơn dâng sớ.", "xau": "Bắt đầu công việc mới, kỵ đi du lịch, kỵ tang lễ." },
  "Khai": { "tot": "Xuất hành, đi tàu thuyền, khởi tạo, động thổ, san nền đắp nền, dựng xây kho vựa, làm hay sửa phòng bếp, thờ cúng Táo Thần, đóng giường lót giường, may áo, lắp đặt cỗ máy dệt hay các loại máy, cấy lúa gặt lúa, đào ao giếng, tháo nước, các việc trong vụ chăn nuôi, mở thông hào rãnh, cầu thầy chữa bệnh, bốc thuốc, uống thuốc, mua trâu, làm rượu, nhập học, học kỹ nghệ, vẽ tranh, tu sửa cây cối.", "xau": "An táng, Chôn cất" },
  "Bế":  { "tot": "Xây đắp tường, đặt táng, gắn cửa, kê gác, làm cầu. Khởi công lò nhuộm lò gốm, uống thuốc, trị bệnh (nhưng chớ trị bệnh mắt), tu sửa cây cối.", "xau": "Lên quan nhậm chức, thừa kế chức tước hay sự nghiệp, nhập học, chữa bệnh mắt." }
}

NHI_THAP_BAT_TU = {
  "Giác": {"tenNgay": "Giác Mộc Giao - Đặng Vũ", "danhGia": "Tốt (Bình Tú)", "nenLam": "Mọi việc tạo tác đều đặng được vinh xương và tấn lợi. Việc hôn nhân hay cưới gả sinh con quý tử. Công danh thăng tiến, khoa cử đỗ đạt cao.", "kiengCu": "Chôn cất hoạn nạn phải ba năm. Dù xây đắp mộ phần hay sửa chữa mộ phần ắt có người chết. Vì vậy, để tránh điềm giữ quý bạn nên chọn một ngày tốt khác để tiến hành chôn cất. Sinh con nhằm ngày Sao Giác chiếu thì sẽ khó nuôi. Tốt nhất đặt tên con theo tên của Sao nó mới được an toàn. Không dùng tên sao này có thể dùng tên Sao của tháng hay của năm cũng mang ý nghĩa tương đương."},
  "Cang": {"tenNgay": "Cang Kim Long - Ngô Hán", "danhGia": "Tốt (Bình Tú)", "nenLam": "Công việc liên quan đến cắt may áo màn sẽ đặng nhiều lộc ăn.", "kiengCu": "Chôn cất bị Trùng tang. Vì vậy, để tránh điềm giữ quý bạn nên chọn một ngày tốt khác để tiến hành chôn cất. Nếu cưới gả e rằng phòng không giá lạnh. Nếu tranh đấu kiện tụng thì lâm bại. Nếu khởi dựng nhà cửa chết con đầu. Trong 10 hoặc 100 ngày sau thì gặp họa, rồi từ đó lần lần tiêu hết ruộng đất, còn nếu làm quan bị cách chức. Sao Cang thuộc vào Thất Sát Tinh, nhằm ngày này sanh con ắt sẽ khó nuôi. Cho nên lấy tên của Sao để đặt cho con thì được yên lành."},
  "Đê": {"tenNgay": "Đê Thổ Lạc - Giả Phục", "danhGia": "Xấu (Hung Tú)", "nenLam": "Sao Đê đại hung, không hợp để làm bất kỳ công việc trọng đại nào.", "kiengCu": "Không nên khởi công xây dựng, chôn cất, cưới gả và xuất hành. Kỵ nhất là đường thủy. Ngày này sinh con chẳng phải điềm lành nên làm âm đức cho con. Đây chỉ là liệt kê các việc Đại Kỵ, còn các việc khác vẫn nên kiêng cữ. Vì vậy, nếu quý bạn có dự định các công việc liên quan đến khởi công xây dựng, chôn cất, cưới gả và xuất hành quý bạn nên chọn một ngày tốt khác để thực hiện."},
  "Phòng": {"tenNgay": "Phòng Nhật Thố - Cảnh Yêm", "danhGia": "Tốt (Kiết Tú)", "nenLam": "Mọi việc khởi công tạo tác đều tốt. Ngày này hợp nhất cho việc cưới gả, xuất hành, xây dựng nhà, chôn cất, đi thuyền, mưu sự, chặt cỏ phá đất và cả cắt áo.", "kiengCu": "Sao Phòng là Đại Kiết Tinh nên không kỵ bất kỳ việc gì. Vì vậy, ngày này nên tiến hành các việc lớn đặc biệt là mua bán như nhà cửa, đất đai hay xe cộ được nhiều may mắn và thuận lợi."},
  "Tâm": {"tenNgay": "Tâm Nguyệt Hồ - Khấu Tuân", "danhGia": "Xấu (Hung Tú)", "nenLam": "Hung tú này tạo tác bất kỳ việc chi cũng không hạp.", "kiengCu": "Khởi công tạo tác việc chi cũng không tránh khỏi hại. Nhất là cưới gả, đóng giường, lót giường, xây cất, chôn cất và tranh tụng. Vì vậy, nên chọn một ngày tốt khác để tiến hành các việc trên, đặc biệt tránh cưới gả nhằm ngày này."},
  "Vĩ": {"tenNgay": "Vĩ Hỏa Hổ - Sầm Bành", "danhGia": "Tốt (Kiết Tú)", "nenLam": "Mọi việc đều tốt. Các vụ khởi tạo, chôn cất, trổ cửa, đào ao giếng, cưới gả, xây cất, khai mương rạch, các vụ thủy lợi, chặt cỏ phá đất là tốt nhất.", "kiengCu": "Đóng giường, lót giường, đi thuyền, mua sắm. Vì vậy, ngày này không nên tiến hành mua sắm như ô tô, xe máy, nhà đất ..."},
  "Cơ": {"tenNgay": "Cơ Thủy Báo - Phùng Dị", "danhGia": "Tốt (Kiết Tú)", "nenLam": "Trăm việc khởi tạo đều tốt. Nhất là việc chôn cất, khai trương, xuất hành, tu bổ mồ mã, trổ cửa, các vụ thủy lợi (như tháo nước, khai thông mương rảnh, đào kênh,...)", "kiengCu": "Các việc lót giường, đóng giường, đi thuyền."},
  "Đẩu": {"tenNgay": "Đẩu Mộc Giải - Tống Hữu", "danhGia": "Tốt (Kiết Tú)", "nenLam": "Khởi tạo trăm việc đều rất tốt. Tốt nhất cho xây đắp, sửa chữa phần mộ, tháo nước, hay trổ cửa, các vụ thủy lợi, chặt cỏ phá đất, may cắt áo mão, hoặc kinh doanh, giao dịch, mưu cầu công danh.", "kiengCu": "Rất kỵ việc đi thuyền. Nên đặt tên con là Đẩu, Giải hay Trại hoặc theo tên của Sao năm hay tháng đó để đặt sẽ dễ nuôi hơn."},
  "Ngưu": {"tenNgay": "Ngưu Kim Ngưu - Sái Tuân", "danhGia": "Xấu (Hung Tú)", "nenLam": "Rất tốt đi thuyền, cắt may áo mão.", "kiengCu": "Khởi công tạo tác bất kỳ việc gì cũng gặp hung hại. Nhất là việc dựng trại, xây cất nhà, trổ cửa, cưới gả, xuất hành đường bộ, làm thủy lợi, nuôi tằm, gieo cấy, khai khẩn cũng như khai trương. Vì vậy, ngày này không nên tiến hành các công việc trọng đại, nên chọn một ngày tốt khác để tiến hành."},
  "Nữ": {"tenNgay": "Nữ Thổ Bức - Cảnh Đan", "danhGia": "Xấu (Hung Tú)", "nenLam": "Hợp kết màn hay may áo.", "kiengCu": "Khởi công tạo tác trăm việc đều có hại. Trong đó hung hại nhất là khơi đường tháo nước, trổ cửa, đầu đơn kiện cáo, chôn cất. Vì vậy, để tránh điềm giữ quý bạn nên chọn một ngày tốt khác để tiến hành chôn cất."},
  "Hư": {"tenNgay": "Hư Nhật Thử - Cái Duyên", "danhGia": "Xấu (Hung Tú)", "nenLam": "Hư có ý nghĩa là hư hoại. Sao Hư mang ý nghĩa không có việc chi hợp.", "kiengCu": "Tạo tác khởi công trăm việc đều không may. Nhất là việc xây cất nhà cửa, khai trương, cưới gả, trổ cửa, đào kênh rạch hay tháo nước. Vì vậy, nếu quý bạn muốn tiến hành các việc động thổ, xây cất nhà, cưới hỏi,... nên chọn một ngày đại cát khác để thực hiện."},
  "Nguy": {"tenNgay": "Nguy Nguyệt Yến - Kiên Đàm", "danhGia": "Xấu (Bình Tú)", "nenLam": "Lót giường bình yên, chôn cất rất tốt.", "kiengCu": "Những việc gác đòn đông, dựng nhà, tháo nước, đào mương rạch, đi thuyền hay trổ cửa. Vì vậy, nếu quý bạn có ý định xây dựng nhà cửa thì nên chọn ngày khác để tiến hành."},
  "Thất": {"tenNgay": "Thất Hỏa Trư - Cảnh Thuần", "danhGia": "Tốt (Kiết Tú)", "nenLam": "Khởi công trăm việc đều đặng tốt. Tốt nhất là tháo nước, các việc thủy lợi, việc đi thuyền, xây cất nhà cửa, trổ cửa, cưới gả, chôn cất hay chặt cỏ phá đất.", "kiengCu": "Sao Thất Đại Kiết nên không có bất kỳ việc gì phải cữ."},
  "Bích": {"tenNgay": "Bích Thủy Du - Tang Cung", "danhGia": "Tốt (Kiết Tú)", "nenLam": "Khởi công tạo tác mọi việc việc chi cũng tốt. Tốt nhất là việc khai trương, xuất hành, chôn cất, xây cất nhà, trổ cửa, dựng cửa, cưới gả, các vụ thuỷ lợi, tháo nước, chặt cỏ phá đất, cắt áo thêu áo, làm nhiều việc thiện ắt thiện quả sẽ tới mau hơn.", "kiengCu": "Sao Bích toàn kiết nên không có bất kỳ việc chi phải kiêng cữ."},
  "Khuê": {"tenNgay": "Khuê Mộc Lang - Mã Vũ", "danhGia": "Xấu (Bình Tú)", "nenLam": "Tốt cho nhập học, cắt áo, tạo dựng nhà phòng hay ra đi cầu công danh.", "kiengCu": "Chôn cất, trổ cửa dựng cửa, khai thông đường nước, việc khai trương, đào ao móc giếng, các vụ thưa kiện và đóng giường lót giường. Vì vậy, nếu quý bạn có ý định chôn cất người chết hay khai trường lập nghiệp thì nên chọn một ngày khác để tiến hành."},
  "Lâu": {"tenNgay": "Lâu Kim Cẩu - Lưu Long", "danhGia": "Tốt (Kiết Tú)", "nenLam": "Khởi công mọi việc đều rất tốt. Tốt nhất là việc dựng cột, cưới gả, trổ cửa, dựng cửa, cất lầu, làm giàn gác, cắt áo, tháo nước hay các vụ thủy lợi.", "kiengCu": "Nhất là lót giường, đóng giường và đi đường thủy."},
  "Vị": {"tenNgay": "Vị Thổ Trĩ - Cảnh Đan", "danhGia": "Tốt (Kiết Tú)", "nenLam": "Khởi tạo tạo tác việc gì cũng tốt. Tốt nhất là cưới gả, xây cất, dọn cỏ, gieo trồng, lấy giống.", "kiengCu": "Đi thuyền"},
  "Mão": {"tenNgay": "Mão Nhật Kê - Vương Lương", "danhGia": "Xấu (Hung Tú)", "nenLam": "Xây dựng cũng như tạo tác đều tốt.", "kiengCu": "Chôn Cất thì ĐẠI KỴ. Cưới gã, khai ngòi phóng thủy, khai trương, xuất hành, đóng giường lót giường, trổ cửa dựng cửa kỵ. Các việc khác đều không hay. Vì vậy, ngày này tuyệt đối không tiến hành chôn cất người chết."},
  "Tất": {"tenNgay": "Tất Nguyệt Ô - Trần Tuấn", "danhGia": "Tốt (Kiết Tú)", "nenLam": "Khởi công tạo tác bất kể việc chi đều tốt. Tốt nhất là việc trổ cửa dựng cửa, đào kinh, tháo nước, khai mương, chôn cất, cưới gả, chặt cỏ phá đất hay móc giếng. Những việc khác như khai trương, xuất hành, nhập học, làm ruộng và nuôi tằm cũng tốt.", "kiengCu": "Việc đi thuyền."},
  "Chủy": {"tenNgay": "Chủy Hỏa Hầu - Phó Tuấn", "danhGia": "Xấu (Hung Tú)", "nenLam": " Sao Chủy không nên làm bất kỳ việc chi.", "kiengCu": "Khởi công tạo tác việc chi cũng không tốt. KỴ NHẤT là chôn cất và các vụ thuộc về chết chôn như sửa đắp mồ mả, làm sanh phần (làm mồ mã để sẵn), đóng thọ đường (đóng hòm để sẵn). Ngày này tuyệt đối không tiến hành chôn cất người chết để tránh gặp điềm dữ."},
  "Sâm": {"tenNgay": "Sâm Thủy Viên - Đỗ Mậu", "danhGia": "Tốt (Bình Tú)", "nenLam": "Nhiều việc khởi công tạo tác tốt như: dựng cửa trổ cửa, xây cất nhà, nhập học, làm thủy lợi, tháo nước đào mương hay đi thuyền.", "kiengCu": "Cưới gả, đóng giường lót giường, chôn cất hay kết bạn đều không tốt. Vì vậy, để việc cưới gả được trăm điềm tốt quý bạn nên chọn một ngày khác để tiến hành."},
  "Tỉnh": {"tenNgay": "Tỉnh Mộc Hãn - Diêu Kỳ", "danhGia": "Tốt (Bình Tú)", "nenLam": "Tạo tác nhiều việc rất tốt như trổ cửa dựng cửa, mở thông đường nước, đào mương móc giếng, đi thuyền, xây cất, nhậm chức hoặc nhập học.", "kiengCu": "Làm sanh phần, đóng thọ đường, chôn cất hay tu bổ mộ phần."},
  "Quỷ": {"tenNgay": "Quỷ Kim Dương - Vương Phách", "danhGia": "Xấu (Hung Tú)", "nenLam": "Việc chôn cất, chặt cỏ phá đất hoặc cắt áo đều tốt.", "kiengCu": "Khởi tạo bất kể việc chi cũng hại. Hại nhất là trổ cửa dựng cửa, tháo nước, việc đào ao giếng, xây cất nhà, cưới gả, động đất, xây tường và dựng cột. Vì vậy, nếu quý bạn đang có ý định động thổ xây nhà hay cưới hỏi thì nên chọn một ngày khác để tiến hành."},
  "Liễu": {"tenNgay": "Liễu Thổ Chương - Nhậm Quang", "danhGia": "Xấu (Hung Tú)", "nenLam": "Không có việc gì tốt.", "kiengCu": "Khởi công tạo tác việc chi cũng rất bất lợi, hung hại. Hung hại nhất là làm thủy lợi như trổ tháo nước, đào ao lũy, chôn cất, việc sửa cửa dựng cửa, xây đắp. Vì vậy, ngày nay không nên tiến hành bất cứ việc trọng đại gì."},
  "Tinh": {"tenNgay": "Tinh Nhật Mã - Lý Trung", "danhGia": "Xấu (Bình Tú)", "nenLam": "Xây dựng phòng mới.", "kiengCu": "Chôn cất, cưới gả, mở thông đường nước."},
  "Trương": {"tenNgay": "Trương Nguyệt Lộc - Vạn Tu", "danhGia": "Tốt (Kiết Tú)", "nenLam": "Khởi công tạo tác trăm việc đều tốt. Trong đó, tốt nhất là che mái dựng hiên, xây cất nhà, trổ cửa dựng cửa, cưới gả, chôn cất, hay làm ruộng, nuôi tằm , làm thuỷ lợi, đặt táng kê gác, chặt cỏ phá đất, cắt áo cũng đều rất tốt.", "kiengCu": "Sửa hay làm thuyền chèo, hoặc đẩy thuyền mới xuống nước."},
  "Dực": {"tenNgay": "Dực Hỏa Xà - Bi Đồng", "danhGia": "Xấu (Hung Tú)", "nenLam": "Nếu cắt áo sẽ đặng được tiền tài.", "kiengCu": "Những việc như chôn cất, xây cất nhà, đặt táng kê gác, gác đòn đông, cưới gã, trổ cửa gắn cửa, các việc thủy lợi. Vì vậy, nếu quý bạn đang muốn tiến hành các việc trên thì nên chọn một ngày đại cát trong tháng để thực hiện."},
  "Chẩn": {"tenNgay": "Chẩn Thủy Dẫn - Lưu Trực", "danhGia": "Tốt (Kiết Tú)", "nenLam": "Mọi việc khởi công tạo tác rất tốt lành. Tốt nhất là cưới gả, xây cất lầu gác và chôn cất. Các việc khác như xuất hành, dựng phòng, chặt cỏ phá đất, cất trại, cũng tốt.", "kiengCu": "Việc đi thuyền."}
}

NGAY_THONG_TIN = {
  "Giáp Tý": { "moTa": "Ngày: Giáp Tý - tức Chi sinh Can (Thủy sinh Mộc), ngày này là ngày cát (nghĩa nhật).", "chiTiet": ["- Nạp âm: Ngày Hải Trung Kim, kỵ các tuổi: Mậu Ngọ và Nhâm Ngọ.","- Ngày này thuộc hành Kim khắc với hành Mộc, ngoại trừ các tuổi: Mậu Tuất vì Kim khắc nên được lợi.","- Ngày Tý lục hợp với Sửu, tam hợp với Thìn và Thân thành Thủy cục. Xung Ngọ, hình Mão, hại Mùi, phá Dậu, tuyệt Tỵ."] },
  "Ất Sửu": { "moTa": "Ngày: Ất Sửu - tức Can khắc Chi (Mộc khắc Thổ), ngày này là ngày cát trung bình (chế nhật).", "chiTiet": ["- Nạp âm: Ngày Hải Trung Kim, kỵ các tuổi: Kỷ Mùi và Quý Mùi.","- Ngày này thuộc hành Kim khắc với hành Mộc, ngoại trừ các tuổi: Kỷ Hợi vì Kim khắc mà được lợi.","- Ngày Sửu lục hợp với Tý, tam hợp với Tỵ và Dậu thành Kim cục. Xung Mùi, hình Tuất, hại Ngọ, phá Thìn, tuyệt Mùi.","- Tam Sát kỵ mệnh các tuổi Dần, Ngọ, Tuất."] },
  "Bính Dần": { "moTa": "Ngày: Bính Dần - tức Chi sinh Can (Mộc sinh Hỏa), ngày này là ngày cát (nghĩa nhật).", "chiTiet": ["- Nạp âm: Ngày Lô Trung Hỏa, kỵ các tuổi: Canh Thân và Nhâm Thân.","- Ngày này thuộc hành Hỏa khắc với hành Kim, ngoại trừ các tuổi: Nhâm Thân và Giáp Ngọ thuộc hành Kim nhưng không sợ Hỏa.","- Ngày Dần lục hợp với Hợi, tam hợp với Ngọ và Tuất thành Hỏa cục. Xung Thân, hình Tỵ, hại Tỵ, phá Hợi, tuyệt Dậu."] },
  "Đinh Mão": { "moTa": "Ngày: Đinh Mão - tức Chi sinh Can (Mộc sinh Hỏa), ngày này là ngày cát (nghĩa nhật).", "chiTiet": ["- Nạp âm: Ngày Lô Trung Hỏa, kỵ các tuổi: Tân Dậu và Quý Dậu.","- Ngày này thuộc hành Hỏa khắc với hành Kim, ngoại trừ các tuổi: Quý Dậu và Ất Mùi thuộc hành Kim nhưng không sợ Hỏa.","- Ngày Mão lục hợp với Tuất, tam hợp với Mùi và Hợi thành Mộc cục. Xung Dậu, hình Tý, hại Thìn, phá Ngọ, tuyệt Thân."] },
  "Mậu Thìn": { "moTa": "Ngày: Mậu Thìn - tức Can Chi tương đồng (cùng Thổ), ngày này là ngày cát.", "chiTiet": ["- Nạp âm: Ngày Đại Lâm Mộc, kỵ các tuổi: Nhâm Tuất và Bính Tuất.","- Ngày này thuộc hành Mộc khắc với hành Thổ, ngoại trừ các tuổi: Canh Ngọ, Mậu Thân và Bính Thìn thuộc hành Thổ không sợ Mộc - Ngày Thìn lục hợp với Dậu, tam hợp với Tý và Thân thành Thủy cục. Xung Tuất, hình Thìn, hình Mùi, hại Mão, phá Sửu, tuyệt Tuất.","- Tam Sát kỵ mệnh các tuổi Tỵ, Dậu, Sửu."] },
  "Kỷ Tỵ": { "moTa": "Ngày: Kỷ Tỵ - tức Chi sinh Can (Hỏa sinh Thổ), ngày này là ngày cát (nghĩa nhật).", "chiTiet": ["- Nạp âm: Ngày Đại Lâm Mộc, kỵ các tuổi: Quý Hợi và Đinh Hợi.","- Ngày này thuộc hành Mộc khắc với hành Thổ, ngoại trừ các tuổi: Tân Mùi, Kỷ Dậu và Đinh Tỵ thuộc hành Thổ không sợ Mộc.","- Ngày Tỵ lục hợp với Thân, tam hợp với Sửu và Dậu thành Kim cục. Xung Hợi, hình Thân, hại Dần, phá Thân, tuyệt Tý."] },
  "Canh Ngọ": { "moTa": "Ngày: Canh Ngọ - tức Chi khắc Can (Hỏa khắc Kim), là ngày hung (phạt nhật).", "chiTiet": ["- Nạp âm: Ngày Lộ Bàng Thổ, kỵ các tuổi: Giáp Tý và Bính Tý.","- Ngày này thuộc hành Thổ khắc với hành Thủy, ngoại trừ các tuổi: Bính Ngọ và Nhâm Tuất thuộc hành Thủy không sợ Thổ.","- Ngày Ngọ lục hợp với Mùi, tam hợp với Dần và Tuất thành Hỏa cục. Xung Tý, hình Ngọ, hình Dậu, hại Sửu, phá Mão, tuyệt Hợi."] },
  "Tân Mùi": { "moTa": "Ngày: Tân Mùi - tức Chi sinh Can (Thổ sinh Kim), ngày này là ngày cát (nghĩa nhật).", "chiTiet": ["- Nạp âm: Ngày Lộ Bàng Thổ, kỵ các tuổi: Ất Sửu và Đinh Sửu.","- Ngày này thuộc hành Thổ khắc với hành Thủy, ngoại trừ các tuổi: Đinh Mùi, Quý Hợi thuộc hành Thủy không sợ Thổ - Ngày Mùi lục hợp với Ngọ, tam hợp với Mão và Hợi thành Mộc cục. Xung Sửu, hình Sửu, hại Tý, phá Tuất, tuyệt Sửu.","- Tam Sát kỵ mệnh các tuổi Thân, Tý, Thìn."] },
  "Nhâm Thân": { "moTa": "Ngày: Nhâm Thân - tức Chi sinh Can (Kim sinh Thủy), ngày này là ngày cát (nghĩa nhật).", "chiTiet": ["- Nạp âm: Ngày Kiếm Phong Kim, kỵ các tuổi: Bính Dần và Canh Dần.","- Ngày này thuộc hành Kim khắc với hành Mộc, ngoại trừ các tuổi: Mậu Tuất vì Kim khắc mà được lợi.","- Ngày Thân lục hợp với Tỵ, tam hợp với Tý và Thìn thành Thủy cục. Xung Dần, hình Dần, hình Hợi, hại Hợi, phá Tỵ, tuyệt Mão."] },
  "Quý Dậu": { "moTa": "Ngày: Quý Dậu - tức Chi sinh Can (Kim sinh Thủy), ngày này là ngày cát (nghĩa nhật).", "chiTiet": ["- Nạp âm: Ngày Kiếm Phong Kim, kỵ các tuổi: Đinh Mão và Tân Mão.","- Ngày này thuộc hành Kim khắc với hành Mộc, ngoại trừ các tuổi: Kỷ Hợi vì Kim khắc mà được lợi.","- Ngày Dậu lục hợp với Thìn, tam hợp với Sửu và Tỵ thành Kim cục. Xung Mão, hình Dậu, hại Tuất, phá Tý, tuyệt Dần."] },
  "Giáp Tuất": { "moTa": "Ngày: Giáp Tuất - tức Can khắc Chi (Mộc khắc Thổ), ngày này là ngày cát trung bình (chế nhật).", "chiTiet": ["- Nạp âm: Ngày Sơn Đầu Hỏa, kỵ các tuổi: Mậu Thìn và Canh Thìn.","- Ngày này thuộc hành Hỏa khắc với hành Kim, ngoại trừ các tuổi: Nhâm Thân và Giáp Ngọ thuộc hành Kim không sợ Hỏa - Ngày Tuất lục hợp với Mão, tam hợp với Dần và Ngọ thành Hỏa cục. Xung Thìn, hình Mùi, hại Dậu, phá Mùi, tuyệt Thìn.","- Tam Sát kỵ mệnh các tuổi Hợi, Mão, Mùi."] },
  "Ất Hợi": { "moTa": "Ngày: Ất Hợi - tức Chi sinh Can (Thủy sinh Mộc), ngày này là ngày cát (nghĩa nhật).", "chiTiet": ["- Nạp âm: Ngày Sơn Đầu Hỏa, kỵ các tuổi: Kỷ Tỵ và Tân Tỵ.","- Ngày này thuộc hành Hỏa khắc với hành Kim, ngoại trừ các tuổi: Quý Dậu và Ất Mùi thuộc hành Kim không sợ Hỏa.","-  Ngày Hợi lục hợp với Dần, tam hợp với Mão và Mùi thành Mộc cục. Xung Tỵ, hình Hợi, hại Thân, phá Dần, tuyệt Ngọ."] },
  "Bính Tý": { "moTa": "Ngày: Bính Tý - tức Chi khắc Can (Thủy khắc Hỏa), là ngày hung (phạt nhật).", "chiTiet": ["- Nạp âm: Ngày Giản Hạ Thủy, kỵ các tuổi: Canh Ngọ và Mậu Ngọ.","- Ngày này thuộc hành Thủy khắc với hành Hỏa, ngoại trừ các tuổi: Mậu Tý, Bính Thân và Mậu Ngọ thuộc hành Hỏa không sợ Thủy.","- Ngày Tý lục hợp với Sửu, tam hợp với Thìn và Thân thành Thủy cục. Xung Ngọ, hình Mão, hại Mùi, phá Dậu, tuyệt Tỵ."] },
  "Đinh Sửu": { "moTa": "Ngày: Đinh Sửu - tức Can sinh Chi (Hỏa sinh Thổ), ngày này là ngày cát (bảo nhật).", "chiTiet": ["- Nạp âm: Ngày Giản Hạ Thủy, kỵ các tuổi: Tân Mùi và Kỷ Mùi.","- Ngày này thuộc hành Thủy khắc với hành Hỏa, ngoại trừ các tuổi: Kỷ Sửu, Đinh Dậu và Kỷ Mùi thuộc hành Hỏa không sợ Thủy - Ngày Sửu lục hợp với Tý, tam hợp với Tỵ và Dậu thành Kim cục. Xung Mùi, hình Tuất, hại Ngọ, phá Thìn, tuyệt Mùi.","- Tam Sát kỵ mệnh các tuổi Dần, Ngọ, Tuất."] },
  "Mậu Dần": { "moTa": "Ngày: Mậu Dần - tức Chi khắc Can (Mộc khắc Thổ), là ngày hung (phạt nhật).", "chiTiet": ["- Nạp âm: Ngày Thành Đầu Thổ, kỵ các tuổi: Nhâm Thân và Giáp Thân.","- Ngày này thuộc hành Thổ khắc với hành Thủy, ngoại trừ các tuổi: Bính Ngọ và Nhâm Tuất thuộc hành Thủy không sợ Thổ.","- Ngày Dần lục hợp với Hợi, tam hợp với Ngọ và Tuất thành Hỏa cục. Xung Thân, hình Tỵ, hại Tỵ, phá Hợi, tuyệt Dậu."] },
  "Kỷ Mão": { "moTa": "Ngày: Kỷ Mão - tức Chi khắc Can (Mộc khắc Thổ), là ngày hung (phạt nhật).", "chiTiet": ["- Nạp âm: Ngày Thành Đầu Thổ, kỵ các tuổi: Quý Dậu và Ất Dậu.","- Ngày này thuộc hành Thổ khắc với hành Thủy, ngoại trừ các tuổi: Đinh Mùi và Quý Hợi thuộc hành Thủy không sợ Thổ.","- Ngày Mão lục hợp với Tuất, tam hợp với Mùi và Hợi thành Mộc cục. Xung Dậu, hình Tý, hại Thìn, phá Ngọ, tuyệt Thân."] },
  "Canh Thìn": { "moTa": "Ngày: Canh Thìn - tức Chi sinh Can (Thổ sinh Kim), ngày này là ngày cát (nghĩa nhật).", "chiTiet": ["- Nạp âm: Ngày Bạch Lạp Kim, kỵ các tuổi: Giáp Tuất và Mậu Tuất.","- Ngày này thuộc hành Kim khắc với hành Mộc, ngoại trừ các tuổi: Mậu Tuất vì Kim khắc mà được lợi - Ngày Thìn lục hợp với Dậu, tam hợp với Tý và Thân thành Thủy cục. Xung Tuất, hình Thìn, hình Mùi, hại Mão, phá Sửu, tuyệt Tuất.","- Tam Sát kỵ mệnh các tuổi Tỵ, Dậu, Sửu."] },
  "Tân Tỵ": { "moTa": "Ngày: Tân Tỵ - tức Chi khắc Can (Hỏa khắc Kim), là ngày hung (phạt nhật).", "chiTiet": ["- Nạp âm: Ngày Bạch Lạp Kim, kỵ các tuổi: Ất Hợi và Kỷ Hợi.","- Ngày này thuộc hành Kim khắc với hành Mộc, ngoại trừ các tuổi: Kỷ Hợi vì Kim khắc mà được lợi.","- Ngày Tỵ lục hợp với Thân, tam hợp với Sửu và Dậu thành Kim cục. Xung Hợi, hình Thân, hại Dần, phá Thân, tuyệt Tý."] },
  "Nhâm Ngọ": { "moTa": "Ngày: Nhâm Ngọ - tức Can khắc Chi (Thủy khắc Hỏa), ngày này là ngày cát trung bình (chế nhật).", "chiTiet": ["- Nạp âm: Ngày Dương Liễu Mộc, kỵ các tuổi: Bính Tý và Canh Tý.","- Ngày này thuộc hành Mộc khắc với hành Thổ, ngoại trừ các tuổi: Canh Ngọ, Mậu Thân và Bính Thìn thuộc hành Thổ không sợ Mộc.","- Ngày Ngọ lục hợp với Mùi, tam hợp với Dần và Tuất thành Hỏa cục. Xung Tý, hình Ngọ, hình Dậu, hại Sửu, phá Mão, tuyệt Hợi."] },
  "Quý Mùi": { "moTa": "Ngày: Quý Mùi - tức Chi khắc Can (Thổ khắc Thủy), là ngày hung (phạt nhật).", "chiTiet": ["- Nạp âm: Ngày Dương Liễu Mộc, kỵ các tuổi: Đinh Sửu và Tân Sửu.","- Ngày này thuộc hành Mộc khắc với hành Thổ, ngoại trừ các tuổi: Tân Mùi, Kỷ Dậu và Đinh Tỵ thuộc hành Thổ không sợ Mộc - Ngày Mùi lục hợp với Ngọ, tam hợp với Mão và Hợi thành Mộc cục. Xung Sửu, hình Sửu, hại Tý, phá Tuất, tuyệt Sửu.","- Tam Sát kỵ mệnh các tuổi Thân, Tý, Thìn."] },
  "Giáp Thân": { "moTa": "Ngày: Giáp Thân - tức Chi khắc Can (Kim khắc Mộc), là ngày hung (phạt nhật).", "chiTiet": ["- Nạp âm: Ngày Tuyền Trung Thủy, kỵ các tuổi: Mậu Dần và Bính Dần.","- Ngày này thuộc hành Thủy khắc với hành Hỏa, ngoại trừ các tuổi: Mậu Tý, Bính Thân và Mậu Ngọ thuộc hành Hỏa không sợ Thủy.","- Ngày Thân lục hợp với Tỵ, tam hợp với Tý và Thìn thành Thủy cục. Xung Dần, hình Dần, hình Hợi, hại Hợi, phá Tỵ, tuyệt Mão."] },
  "Ất Dậu": { "moTa": "Ngày: Ất Dậu - tức Chi khắc Can (Kim khắc Mộc), là ngày hung (phạt nhật).", "chiTiet": ["- Nạp âm: Ngày Tuyền Trung Thủy, kỵ các tuổi: Kỷ Mão và Đinh Mão.","- Ngày này thuộc hành Thủy khắc với hành Hỏa, ngoại trừ các tuổi: Kỷ Sửu, Đinh Dậu và Kỷ Mùi thuộc hành Hỏa không sợ Thủy.","- Ngày Dậu lục hợp với Thìn, tam hợp với Sửu và Tỵ thành Kim cục. Xung Mão, hình Dậu, hại Tuất, phá Tý, tuyệt Dần."] },
  "Bính Tuất": { "moTa": "Ngày: Bính Tuất - tức Can sinh Chi (Hỏa sinh Thổ), ngày này là ngày cát (bảo nhật).", "chiTiet": ["- Nạp âm: Ngày Ốc Thượng Thổ, kỵ các tuổi: Canh Thìn và Nhâm Thìn.","- Ngày này thuộc hành Thổ khắc với hành Thủy, ngoại trừ các tuổi: Bính Ngọ và Nhâm Tuất thuộc hành Thủy không sợ Thổ - Ngày Tuất lục hợp với Mão, tam hợp với Dần và Ngọ thành Hỏa cục. Xung Thìn, hình Mùi, hại Dậu, phá Mùi, tuyệt Thìn.","- Tam Sát kỵ mệnh các tuổi Hợi, Mão, Mùi."] },
  "Đinh Hợi": { "moTa": "Ngày: Đinh Hợi - tức Chi khắc Can (Thủy khắc Hỏa), là ngày hung (phạt nhật).", "chiTiet": ["- Nạp âm: Ngày Ốc Thượng Thổ, kỵ các tuổi: Tân Tỵ và Quý Tỵ.","- Ngày này thuộc hành Thổ khắc với hành Thủy, ngoại trừ các tuổi: Đinh Mùi và Quý Hợi thuộc hành Thủy không sợ Thổ.","- Ngày Hợi lục hợp với Dần, tam hợp với Mão và Mùi thành Mộc cục. Xung Tỵ, hình Hợi, hại Thân, phá Dần, tuyệt Ngọ."] },
  "Mậu Tý": { "moTa": "Ngày: Mậu Tý - tức Can khắc Chi (Thổ khắc Thủy), ngày này là ngày cát trung bình (chế nhật).", "chiTiet": ["- Nạp âm: Ngày Phích Lịch Hỏa, kỵ các tuổi: Nhâm Ngọ và Giáp Ngọ.","- Ngày này thuộc hành Hỏa khắc với hành Kim, ngoại trừ các tuổi: Nhâm Thân và Giáp Ngọ thuộc hành Kim không sợ Hỏa.","- Ngày Tý lục hợp với Sửu, tam hợp với Thìn và Thân thành Thủy cục. Xung Ngọ, hình Mão, hại Mùi, phá Dậu, tuyệt Tỵ."] },
  "Kỷ Sửu": { "moTa": "Ngày: Kỷ Sửu - tức Can Chi tương đồng (cùng Thổ), ngày này là ngày cát.", "chiTiet": ["- Nạp âm: Ngày Phích Lịch Hỏa, kỵ các tuổi: Quý Mùi và Ất Mùi.","- Ngày này thuộc hành Hỏa khắc với hành Kim, ngoại trừ các tuổi: Quý Dậu thuộc hành Kim không sợ Hỏa - Ngày Sửu lục hợp với Tý, tam hợp với Tỵ và Dậu thành Kim cục. Xung Mùi, hình Tuất, hại Ngọ, phá Thìn, tuyệt Mùi.","- Tam Sát kỵ mệnh các tuổi Dần, Ngọ, Tuất."] },
  "Canh Dần": { "moTa": "Ngày: Canh Dần - tức Can khắc Chi (Kim khắc Mộc), ngày này là ngày cát trung bình (chế nhật).", "chiTiet": ["- Nạp âm: Ngày Tùng Bách Mộc, kỵ các tuổi: Giáp Thân và Mậu Thân.","- Ngày này thuộc hành Mộc khắc với hành Thổ, ngoại trừ các tuổi: Canh Ngọ, Mậu Thân và Bính Thìn thuộc hành Thổ không sợ Mộc.","- Ngày Dần lục hợp với Hợi, tam hợp với Ngọ và Tuất thành Hỏa cục. Xung Thân, hình Tỵ, hại Tỵ, phá Hợi, tuyệt Dậu."] },
  "Tân Mão": { "moTa": "Ngày: Tân Mão - tức Can khắc Chi (Kim khắc Mộc), ngày này là ngày cát trung bình (chế nhật).", "chiTiet": ["- Nạp âm: Ngày Tùng Bách Mộc, kỵ các tuổi: Ất Dậu và Kỷ Dậu.","- Ngày này thuộc hành Mộc khắc với hành Thổ, ngoại trừ các tuổi: Tân Mùi, Kỷ Dậu, Đinh Tỵ thuộc hành Thổ không sợ Mộc.","- Ngày Mão lục hợp với Tuất, tam hợp với Mùi và Hợi thành Mộc cục. Xung Dậu, hình Tý, hại Thìn, phá Ngọ, tuyệt Thân."] },
  "Nhâm Thìn": { "moTa": "Ngày: Nhâm Thìn - tức Chi khắc Can (Thổ khắc Thủy), là ngày hung (phạt nhật).", "chiTiet": ["- Nạp âm: Ngày Trường Lưu Thủy, kỵ các tuổi: Bính Tuất và Giáp Tuất.","- Ngày này thuộc hành Thủy khắc với hành Hỏa, ngoại trừ các tuổi: Mậu Tý, Bính Thân và Mậu Ngọ thuộc hành Hỏa không sợ Thủy - Ngày Thìn lục hợp với Dậu, tam hợp với Tý và Thân thành Thủy cục. Xung Tuất, hình Thìn, hình Mùi, hại Mão, phá Sửu, tuyệt Tuất.","- Tam Sát kỵ mệnh các tuổi Tỵ, Dậu, Sửu."] },
  "Quý Tỵ": { "moTa": "Ngày: Quý Tỵ - tức Can khắc Chi (Thủy khắc Hỏa), ngày này là ngày cát trung bình (chế nhật).", "chiTiet": ["- Nạp âm: Ngày Trường Lưu Thủy, kỵ các tuổi: Đinh Hợi và Ất Hợi.","- Ngày này thuộc hành Thủy khắc với hành Hỏa, ngoại trừ các tuổi: Kỷ Sửu, Đinh Dậu và Kỷ Mùi thuộc hành Hỏa không sợ Thủy.","- Ngày Tỵ lục hợp với Thân, tam hợp với Sửu và Dậu thành Kim cục. Xung Hợi, hình Thân, hại Dần, phá Thân, tuyệt Tý."] },
  "Giáp Ngọ": { "moTa": "Ngày: Giáp Ngọ - tức Can sinh Chi (Mộc sinh Hỏa), ngày này là ngày cát (bảo nhật).", "chiTiet": ["- Nạp âm: Ngày Sa Trung Kim, kỵ các tuổi: Mậu Tý và Nhâm Tý.","- Ngày này thuộc hành Kim khắc với hành Mộc, ngoại trừ các tuổi: Mậu Tuất vì Kim khắc mà được lợi.","- Ngày Ngọ lục hợp với Mùi, tam hợp với Dần và Tuất thành Hỏa cục. Xung Tý, hình Ngọ, hình Dậu, hại Sửu, phá Mão, tuyệt Hợi."] },
  "Ất Mùi": { "moTa": "Ngày: Ất Mùi - tức Can khắc Chi (Mộc khắc Thổ), ngày này là ngày cát trung bình (chế nhật).", "chiTiet": ["- Nạp âm: Ngày Sa Trung Kim, kỵ các tuổi: Kỷ Sửu và Quý Sửu.","- Ngày này thuộc hành Kim khắc với hành Mộc, ngoại trừ các tuổi: Kỷ Hợi vì Kim khắc mà được lợi - Ngày Mùi lục hợp với Ngọ, tam hợp với Mão và Hợi thành Mộc cục. Xung Sửu, hình Sửu, hại Tý, phá Tuất, tuyệt Sửu.","- Tam Sát kỵ mệnh các tuổi Thân, Tý, Thìn."] },
  "Bính Thân": { "moTa": "Ngày: Bính Thân - tức Can khắc Chi (Hỏa khắc Kim), ngày này là ngày cát trung bình (chế nhật).", "chiTiet": ["- Nạp âm: Ngày Sơn Hạ Hỏa, kỵ các tuổi: Canh Dần và Nhâm Dần.","- Ngày này thuộc hành Hỏa khắc với hành Kim, ngoại trừ các tuổi: Nhâm Thân và Giáp Ngọ thuộc hành Kim không sợ Hỏa.","- Ngày Thân lục hợp với Tỵ, tam hợp với Tý và Thìn thành Thủy cục. Xung Dần, hình Dần, hình Hợi, hại Hợi, phá Tỵ, tuyệt Mão."] },
  "Đinh Dậu": { "moTa": "Ngày: Đinh Dậu  - tức Can khắc Chi (Hỏa khắc Kim), ngày này là ngày cát trung bình (chế nhật).", "chiTiet": ["- Nạp âm: Ngày Sơn Hạ Hỏa, kỵ các tuổi: Tân Mão và Quý Mão.","- Ngày này thuộc hành Hỏa khắc với hành Kim, ngoại trừ các tuổi: Quý Dậu và Ất Mùi thuộc hành Kim không sợ Hỏa.","- Ngày Dậu lục hợp với Thìn, tam hợp với Sửu và Tỵ thành Kim cục. Xung Mão, hình Dậu, hại Tuất, phá Tý, tuyệt Dần."] },
  "Mậu Tuất": { "moTa": "Ngày: Mậu Tuất - tức Can Chi tương đồng (cùng Thổ), ngày này là ngày cát.", "chiTiet": ["- Nạp âm: Ngày Bình Địa Mộc, kỵ các tuổi: Nhâm Thìn và Giáp Ngọ.","- Ngày này thuộc hành Mộc khắc với hành Thổ, ngoại trừ các tuổi: Canh Ngọ, Mậu Thân và Bính Thìn thuộc hành Thổ không sợ Mộc.","- Ngày Tuất lục hợp với Mão, tam hợp với Dần và Ngọ thành Hỏa cục. Xung Thìn, hình Mùi, hại Dậu, phá Mùi, tuyệt Thìn. Tam Sát kỵ mệnh tuổi Hợi, Mão, Mùi."] },
  "Kỷ Hợi": { "moTa": "Ngày: Kỷ Hợi - tức Can khắc Chi (Thổ khắc Thủy), ngày này là ngày cát trung bình (chế nhật).", "chiTiet": ["- Nạp âm: Ngày Bình Địa Mộc, kỵ các tuổi: Quý Tỵ và Ất Mùi.","- Ngày này thuộc hành Mộc khắc với hành Thổ, ngoại trừ các tuổi: Tân Mùi, Kỷ Dậu và Đinh Tỵ thuộc hành Thổ không sợ Mộc.","- Ngày Hợi lục hợp với Dần, tam hợp với Mão và Mùi thành Mộc cục. Xung Tỵ, hình Hợi, hại Thân, phá Dần, tuyệt Ngọ."] },
  "Canh Tý": { "moTa": "Ngày: Canh Tý - tức Can sinh Chi (Kim sinh Thủy), ngày này là ngày cát (bảo nhật).", "chiTiet": ["- Nạp âm: Ngày Bích Thượng Thổ, kỵ các tuổi: Giáp Ngọ và Bính Ngọ.","- Ngày này thuộc hành Thổ khắc với hành Thủy, ngoại trừ các tuổi: Bính Ngọ và Nhâm Tuất thuộc hành Thủy không sợ Thổ.","- Ngày Tý lục hợp với Sửu, tam hợp với Thìn và Thân thành Thủy cục. Xung Ngọ, hình Mão, hại Mùi, phá Dậu, tuyệt Tỵ."] },
  "Tân Sửu": { "moTa": "Ngày: Tân Sửu - tức Chi sinh Can (Thổ sinh Kim), ngày này là ngày cát (nghĩa nhật).", "chiTiet": ["- Nạp âm: Ngày Bích Thượng Thổ, kỵ các tuổi: Ất Mùi và Đinh Mùi.","- Ngày này thuộc hành Thổ khắc với hành Thủy, ngoại trừ các tuổi: Đinh Mùi và Quý Hợi thuộc hành Thủy không sợ Thổ.","- Ngày Sửu lục hợp với Tý, tam hợp với Tỵ và Dậu thành Kim cục. Xung Mùi, hình Tuất, hại Ngọ, phá Thìn, tuyệt Mùi. Tam Sát kỵ mệnh tuổi Dần, Ngọ, Tuất."] },
  "Nhâm Dần": { "moTa": "Ngày: Nhâm Dần - tức Can sinh Chi (Thủy sinh Mộc), ngày này là ngày cát (bảo nhật).", "chiTiet": ["- Nạp âm: Ngày Kim Bạc Kim, kỵ các tuổi: Bính Thân và Canh Thân.","- Ngày này thuộc hành Kim khắc với hành Mộc, ngoại trừ các tuổi: Mậu Tuất vì Kim khắc mà được lợi.","- Ngày Dần lục hợp với Hợi, tam hợp với Ngọ và Tuất thành Hỏa cục. Xung Thân, hình Tỵ, hại Tỵ, phá Hợi, tuyệt Dậu."] },
  "Quý Mão": { "moTa": "Ngày: Quý Mão - tức Can sinh Chi (Thủy sinh Mộc), ngày này là ngày cát (bảo nhật).", "chiTiet": ["- Nạp âm: Ngày Kim Bạc Kim, kỵ các tuổi: Đinh Dậu và Tân Dậu.","- Ngày này thuộc hành Kim khắc với hành Mộc, ngoại trừ các tuổi: Kỷ Hợi vì Kim khắc mà được lợi.","- Ngày Mão lục hợp với Tuất, tam hợp với Mùi và Hợi thành Mộc cục. Xung Dậu, hình Tý, hại Thìn, phá Ngọ, tuyệt Thân."] },
  "Giáp Thìn": { "moTa": "Ngày: Giáp Thìn - tức Can khắc Chi (Mộc khắc Thổ), ngày này là ngày cát trung bình (chế nhật).", "chiTiet": ["- Nạp âm: Ngày Phúc Đăng Hỏa, kỵ các tuổi: Mậu Tuất và Canh Tuất.","- Ngày này thuộc hành Hỏa khắc với hành Kim, ngoại trừ các tuổi: Nhâm Thân và Giáp Ngọ thuộc hành Kim không sợ Hỏa.","- Ngày Thìn lục hợp với Dậu, tam hợp với Tý và Thân thành Thủy cục. Xung Tuất, hình Thìn, hình Mùi, hại Mão, phá Sửu, tuyệt Tuất. Tam Sát kỵ mệnh các tuổi Tỵ, Dậu, Sửu."] },
  "Ất Tỵ": { "moTa": "Ngày: Ất Tỵ - tức Can sinh Chi (Mộc sinh Hỏa), ngày này là ngày cát (bảo nhật).", "chiTiet": ["- Nạp âm: Ngày Phúc Đăng Hỏa, kỵ các tuổi: Kỷ Hợi và Tân Hợi.","- Ngày này thuộc hành Hỏa khắc với hành Kim, ngoại trừ các tuổi: Quý Dậu và Ất Mùi thuộc hành Kim không sợ Hỏa.","- Ngày Tỵ lục hợp với Thân, tam hợp với Sửu và Dậu thành Kim cục. Xung Hợi, hình Thân, hại Dần, phá Thân, tuyệt Tý."] },
  "Bính Ngọ": { "moTa": "Ngày: Bính Ngọ - tức Can Chi tương đồng (cùng Hỏa), ngày này là ngày cát.", "chiTiet": ["- Nạp âm: Ngày Thiên Hà Thủy, kỵ các tuổi: Canh Tý.","- Ngày này thuộc hành Thủy khắc với hành Hỏa, ngoại trừ các tuổi: Mậu Tý, Bính Thân và Mậu Ngọ thuộc hành Hỏa không sợ Thủy.","- Ngày Ngọ lục hợp với Mùi, tam hợp với Dần và Tuất thành Hỏa cục. Xung Tý, hình Ngọ, hình Dậu, hại Sửu, phá Mão, tuyệt Hợi."] },
  "Đinh Mùi": { "moTa": "Ngày: Đinh Mùi - tức Can sinh Chi (Hỏa sinh Thổ), ngày này là ngày cát (bảo nhật).", "chiTiet": ["- Nạp âm: Ngày Thiên Hà Thủy, kỵ các tuổi: Tân Sửu.","- Ngày này thuộc hành Thủy khắc với hành Hỏa, ngoại trừ các tuổi: Kỷ Sửu, Đinh Dậu và Kỷ Mùi thuộc hành Hỏa không sợ Thủy.","- Ngày Mùi lục hợp với Ngọ, tam hợp với Mão và Hợi thành Mộc cục. Xung Sửu, hình Sửu, hại Tý, phá Tuất, tuyệt Sửu. Tam Sát kỵ mệnh tuổi Thân, Tý, Thìn."] },
  "Mậu Thân": { "moTa": "Ngày: Mậu Thân - tức Can sinh Chi (Thổ sinh Kim), ngày này là ngày cát (bảo nhật).", "chiTiet": ["- Nạp âm: Ngày Đại Dịch Thổ, kỵ các tuổi: Nhâm Dần và Giáp Dần.","- Ngày này thuộc hành Thổ khắc với hành Thủy, ngoại trừ các tuổi: Bính Ngọ và Nhâm Tuất thuộc hành Thủy không sợ Thổ.","- Ngày Thân lục hợp với Tỵ, tam hợp với Tý và Thìn thành Thủy cục. Xung Dần, hình Dần, hình Hợi, hại Hợi, phá Tỵ, tuyệt Mão."] },
  "Kỷ Dậu": { "moTa": "Ngày: Kỷ Dậu - tức Can sinh Chi (Thổ sinh Kim), ngày này là ngày cát (bảo nhật).", "chiTiet": ["- Nạp âm: Ngày Đại Dịch Thổ, kỵ các tuổi: Quý Mão và Ất Mão.","- Ngày này thuộc hành Thổ khắc với hành Thủy, ngoại trừ các tuổi: Đinh Mùi và Quý Hợi thuộc hành Thủy không sợ Thổ.","- Ngày Dậu lục hợp với Thìn, tam hợp với Sửu và Tỵ thành Kim cục. Xung Mão, hình Dậu, hại Tuất, phá Tý, tuyệt Dần."] },
  "Canh Tuất": { "moTa": "Ngày: Canh Tuất - tức Chi sinh Can (Thổ sinh Kim), ngày này là ngày cát (nghĩa nhật).", "chiTiet": ["- Nạp âm: Ngày Thoa Xuyến Kim, kỵ các tuổi: Giáp Thìn và Mậu Thìn.","- Ngày này thuộc hành Kim khắc với hành Mộc, ngoại trừ các tuổi: Mậu Tuất vì Kim khắc mà được lợi.","- Ngày Tuất lục hợp với Mão, tam hợp với Dần và Ngọ thành Hỏa cục. Xung Thìn, hình Mùi, hại Dậu, phá Mùi, tuyệt Thìn. Tam Sát kỵ mệnh các tuổi Hợi, Mão, Mùi."] },
  "Tân Hợi": { "moTa": "Ngày: Tân Hợi - tức Can sinh Chi (Kim sinh Thủy), ngày này là ngày cát (bảo nhật).", "chiTiet": ["- Nạp âm: Ngày Thoa Xuyến Kim, kỵ các tuổi: Ất Tỵ và Kỷ Tỵ.","- Ngày này thuộc hành Kim khắc với hành Mộc, ngoại trừ các tuổi: Kỷ Hợi vì Kim khắc mà được lợi.","- Ngày Hợi lục hợp với Dần, tam hợp với Mão và Mùi thành Mộc cục. Xung Tỵ, hình Hợi, hại Thân, phá Dần, tuyệt Ngọ."] },
  "Nhâm Tý": { "moTa": "Ngày: Nhâm Tý - tức Can Chi tương đồng ( cùng Thủy), ngày này là ngày cát.", "chiTiet": ["- Nạp âm: Ngày Tang Chá Mộc, kỵ các tuổi: Bính Ngọ và Canh Ngọ.","- Ngày này thuộc hành Mộc khắc với hành Thổ, ngoại trừ các tuổi: Canh Ngọ, Mậu Thân và Bính Thìn thuộc hành Thổ không sợ Mộc.","- Ngày Tý lục hợp với Sửu, tam hợp với Thìn và Thân thành Thủy cục. Xung Ngọ, hình Mão, hại Mùi, phá Dậu, tuyệt Tỵ."] },
  "Quý Sửu": { "moTa": "Ngày: Quý Sửu - tức Chi khắc Can (Thổ khắc Thủy), là ngày hung (phạt nhật).", "chiTiet": ["- Nạp âm: Ngày Tang Chá Mộc, kỵ các tuổi: Đinh Mùi và Tân Mùi.","- Ngày này thuộc hành Mộc khắc với hành Thổ, ngoại trừ các tuổi: Tân Mùi, Kỷ Dậu và Đinh Tỵ thuộc hành Thổ không sợ Mộc.","- Ngày Sửu lục hợp với Tý, tam hợp với Tỵ và Dậu thành Kim cục. Xung Mùi, hình Tuất, hại Ngọ, phá Thìn, tuyệt Mùi. Tam Sát kỵ mệnh các tuổi Dần, Ngọ, Tuất."] },
  "Giáp Dần": { "moTa": "Ngày: Giáp Dần - tức Can Chi tương đồng (cùng Mộc), ngày này là ngày cát.", "chiTiet": ["- Nạp âm: Ngày Đại Khê Thủy, kỵ các tuổi: Mậu Thân và Bính Thân.","- Ngày này thuộc hành Thủy khắc với hành Hỏa, ngoại trừ các tuổi: Mậu Tý, Bính Thân và Mậu Ngọ thuộc hành Hỏa không sợ Thủy.","- Ngày Dần lục hợp với Hợi, tam hợp với Ngọ và Tuất thành Hỏa cục. Xung Thân, hình Tỵ, hại Tỵ, phá Hợi, tuyệt Dậu."] },
  "Ất Mão": { "moTa": "Ngày: Ất Mão - tức Can Chi tương đồng (cùng Mộc), ngày này là ngày cát.", "chiTiet": ["- Nạp âm: Ngày Đại Khê Thủy, kỵ các tuổi: Kỷ Dậu và Đinh Dậu.","- Ngày này thuộc hành Thủy khắc với hành Hỏa, ngoại trừ các tuổi: Kỷ Sửu, Đinh Dậu và Kỷ Mùi thuộc hành Hỏa không sợ Thủy.","- Ngày Mão lục hợp với Tuất, tam hợp với Mùi và Hợi thành Mộc cục. Xung Dậu, hình Tý, hại Thìn, phá Ngọ, tuyệt Thân."] },
  "Bính Thìn": { "moTa": "Ngày: Bính Thìn - tức Can sinh Chi (Hỏa sinh Thổ), ngày này là ngày cát (bảo nhật).", "chiTiet": ["- Nạp âm: Ngày Sa Trung Thổ, kỵ các tuổi: Canh Tuất và Nhâm Tuất.","- Ngày này thuộc hành Thổ khắc với hành Thủy, ngoại trừ các tuổi: Bính Ngọvà Nhâm Tuất thuộc hành Thủy không sợ Thổ.","- Ngày Thìn lục hợp với Dậu, tam hợp với Tý và Thân thành Thủy cục. Xung Tuất, hình Thìn, hình Mùi, hại Mão, phá Sửu, tuyệt Tuất. Tam Sát kỵ mệnh tuổi Tỵ, Dậu, Sửu."] },
  "Đinh Tỵ": { "moTa": "Ngày: Đinh Tỵ - tức Can Chi tương đồng (cùng Hỏa), ngày này là ngày cát.", "chiTiet": ["- Nạp âm:  Ngày Sa Trung Thổ, kỵ các tuổi: Tân Hợi và Quý Hợi.","- Ngày này thuộc hành Thổ khắc với hành Thủy, ngoại trừ các tuổi: Đinh Mùi và Quý Hợi thuộc hành Thủy không sợ Thổ.","- Ngày Tỵ lục hợp với Thân, tam hợp với Sửu và Dậu thành Kim cục. Xung Hợi, hình Thân, hại Dần, phá Thân, tuyệt Tý."] },
  "Mậu Ngọ": { "moTa": "Ngày: Mậu Ngọ - tức Chi sinh Can (Hỏa sinh Thổ), ngày này là ngày cát (nghĩa nhật).", "chiTiet": ["- Nạp âm: Ngày Thiên Thượng Hỏa, kỵ các tuổi: Nhâm Tý và Giáp Tý.","- Ngày này thuộc hành Hỏa khắc với hành Kim, ngoại trừ các tuổi: Nhâm Thân và Giáp Ngọ thuộc hành Kim không sợ Hỏa.","- Ngày Ngọ lục hợp với Mùi, tam hợp với Dần và Tuất thành Hỏa cục. Xung Tý, hình Ngọ, hình Dậu, hại Sửu, phá Mão, tuyệt Hợi."] },
  "Kỷ Mùi": { "moTa": "Ngày: Kỷ Mùi - tức Can Chi tương đồng (cùng Thổ), ngày này là ngày cát.", "chiTiet": ["- Nạp âm: Ngày Thiên Thượng Hỏa, kỵ các tuổi: Quý Sửu và Ất Sửu.","- Ngày này thuộc hành Hỏa khắc với hành Kim, ngoại trừ các tuổi: Quý Dậu và Ất Mùi thuộc hành Kim không sợ Hỏa.","- Ngày Mùi lục hợp với Ngọ, tam hợp với Mão và Hợi thành Mộc cục. Xung Sửu, hình Sửu, hại Tý, phá Tuất, tuyệt Sửu. Tam Sát kỵ mệnh các tuổi Thân, Tý, Thìn."] },
  "Canh Thân": { "moTa": "Ngày: Canh Thân - tức Can Chi tương đồng (cùng Kim), ngày này là ngày cát.", "chiTiet": ["- Nạp âm: Ngày Thạch Lựu Mộc, kỵ các tuổi: Giáp Dần và Mậu Dần.","- Ngày này thuộc hành Mộc khắc với hành Thổ, ngoại trừ các tuổi: Canh Ngọ, Mậu Thân và Bính Thìn thuộc hành Thổ không sợ Mộc.","- Ngày Thân lục hợp với Tỵ, tam hợp với Tý và Thìn thành Thủy cục. Xung Dần, hình Dần, hình Hợi, hại Hợi, phá Tỵ, tuyệt Mão."] },
  "Tân Dậu": { "moTa": "Ngày: Tân Dậu - tức Can Chi tương đồng (cùng Kim), ngày này là ngày cát.", "chiTiet": ["- Nạp âm: Ngày Thạch Lựu Mộc, kỵ các tuổi: Ất Mão và Kỷ Mão.","- Ngày này thuộc hành Mộc khắc với hành Thổ, ngoại trừ các tuổi: Tân Mùi, Kỷ Dậu và Đinh Tỵ thuộc hành Thổ không sợ Mộc.","- Ngày Dậu lục hợp với Thìn, tam hợp với Sửu và Tỵ thành Kim cục. Xung Mão, hình Dậu, hại Tuất, phá Tý, tuyệt Dần."] },
  "Nhâm Tuất": { "moTa": "Ngày: Nhâm Tuất - tức Chi khắc Can (Thổ khắc Thủy), là ngày hung (phạt nhật).", "chiTiet": ["- Nạp âm: Ngày Đại Hải Thủy, kỵ các tuổi: Bính Thìn và Giáp Thìn.","- Ngày này thuộc hành Thủy khắc với hành Hỏa, ngoại trừ các tuổi: Mậu Tý, Bính Thân và Mậu Ngọ thuộc hành Hỏa không sợ Thủy. Ngày Tuất lục hợp với Mão, tam hợp với Dần và Ngọ thành Hỏa cục. Xung Thìn, hình Mùi, hại Dậu, phá Mùi, tuyệt Thìn.","- Tam Sát kỵ mệnh các tuổi Hợi, Mão, Mùi."] },
  "Quý Hợi": { "moTa": "Ngày: Quý Hợi - tức Can Chi tương đồng (Thủy), ngày này là ngày cát.", "chiTiet": ["- Nạp âm: Ngày Đại Hải Thủy, kỵ các tuổi: Đinh Tỵ và Ất Tỵ.","- Ngày này thuộc hành Thủy khắc với hành Hỏa, ngoại trừ các tuổi: Kỷ Sửu, Đinh Dậu và Kỷ Mùi thuộc hành Hỏa không sợ Thủy.","- Ngày Hợi lục hợp với Dần, tam hợp với Mão và Mùi thành Mộc cục. Xung Tỵ, hình Hợi, hại Thân, phá Dần, tuyệt Ngọ."] },
}

# ===== Hướng xuất hành =====
HUONG = {
    "DONG_BAC": "Đông Bắc", "TAY_BAC": "Tây Bắc", "TAY_NAM": "Tây Nam",
    "CHINH_NAM": "Chính Nam", "DONG_NAM": "Đông Nam", "CHINH_DONG": "Chính Đông",
    "CHINH_BAC": "Chính Bắc", "CHINH_TAY": "Chính Tây",
}
HY_THAN_RULES = {
    HUONG["DONG_BAC"]: ["Giáp", "Kỷ"], HUONG["TAY_BAC"]: ["Ất", "Canh"],
    HUONG["TAY_NAM"]: ["Bính", "Tân"], HUONG["CHINH_NAM"]: ["Đinh", "Nhâm"],
    HUONG["DONG_NAM"]: ["Mậu", "Quý"],
}
TAI_THAN_RULES = {
    HUONG["DONG_NAM"]: ["Giáp", "Ất"], HUONG["CHINH_DONG"]: ["Bính", "Đinh"],
    HUONG["CHINH_BAC"]: ["Mậu"], HUONG["CHINH_NAM"]: ["Kỷ"],
    HUONG["TAY_NAM"]: ["Canh", "Tân"], HUONG["CHINH_TAY"]: ["Nhâm"],
    HUONG["TAY_BAC"]: ["Quý"],
}
HAC_THAN_FREE = {
    "QuýTỵ", "GiápNgọ", "ẤtMùi", "BínhThân", "ĐinhDậu", "MậuTuất", "KỷHợi", "CanhTý",
    "TânSửu", "NhâmDần", "QuýMão", "GiápThìn", "ẤtTỵ", "BínhNgọ", "ĐinhMùi", "MậuThân"
}
HAC_THAN_MAP = {
    "KỷDậu": HUONG["DONG_BAC"], "CanhTuất": HUONG["DONG_BAC"], "TânHợi": HUONG["DONG_BAC"],
    "NhâmTý": HUONG["DONG_BAC"], "QuýSửu": HUONG["DONG_BAC"], "GiápDần": HUONG["DONG_BAC"],
    "ẤtMão": HUONG["CHINH_DONG"], "BínhThìn": HUONG["CHINH_DONG"], "ĐinhTỵ": HUONG["CHINH_DONG"],
    "MậuNgọ": HUONG["CHINH_DONG"], "KỷMùi": HUONG["CHINH_DONG"], "CanhThân": HUONG["DONG_NAM"],
    "TânDậu": HUONG["DONG_NAM"], "NhâmTuất": HUONG["DONG_NAM"], "QuýHợi": HUONG["DONG_NAM"],
    "GiápTý": HUONG["DONG_NAM"], "ẤtSửu": HUONG["DONG_NAM"], "BínhDần": HUONG["CHINH_NAM"],
    "ĐinhMão": HUONG["CHINH_NAM"], "MậuThìn": HUONG["CHINH_NAM"], "KỷTỵ": HUONG["CHINH_NAM"],
    "CanhNgọ": HUONG["CHINH_NAM"], "TânMùi": HUONG["TAY_NAM"], "NhâmThân": HUONG["TAY_NAM"],
    "QuýDậu": HUONG["TAY_NAM"], "GiápTuất": HUONG["TAY_NAM"], "ẤtHợi": HUONG["TAY_NAM"],
    "BínhTý": HUONG["TAY_NAM"], "ĐinhSửu": HUONG["CHINH_TAY"], "MậuDần": HUONG["CHINH_TAY"],
    "KỷMão": HUONG["CHINH_TAY"], "CanhThìn": HUONG["CHINH_TAY"], "TânTỵ": HUONG["CHINH_TAY"],
    "NhâmNgọ": HUONG["TAY_BAC"], "QuýMùi": HUONG["TAY_BAC"], "GiápThân": HUONG["TAY_BAC"],
    "ẤtDậu": HUONG["TAY_BAC"], "BínhTuất": HUONG["TAY_BAC"], "ĐinhHợi": HUONG["TAY_BAC"],
    "MậuTý": HUONG["CHINH_BAC"], "KỷSửu": HUONG["CHINH_BAC"], "CanhDần": HUONG["CHINH_BAC"],
    "TânMão": HUONG["CHINH_BAC"], "NhâmThìn": HUONG["CHINH_BAC"]
}


# ===== Các hàm tính toán cơ bản =====

def INT(d): return floor(d)

def jdn(dd, mm, yy):
    a = INT((14 - mm) / 12)
    y = yy + 4800 - a
    m = mm + 12 * a - 3
    return dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045

def jd_to_date(jd):
    Z = jd
    if Z < 2299161:
        A = Z
    else:
        alpha = INT((Z-1867216.25)/36524.25)
        A = Z + 1 + alpha - INT(alpha/4)
    B = A + 1524
    C = INT((B-122.1)/365.25)
    D = INT(365.25*C)
    E = INT((B-D)/30.6001)
    dd = INT(B - D - INT(30.6001*E))
    if E < 14: mm = E - 1 
    else: mm = E - 13
    if mm < 3: yyyy = C - 4715
    else: yyyy = C - 4716
    return (dd, mm, yyyy)

def decode_lunar_year(yy, k):
    month_lengths = [29, 30]
    regular_months = [0] * 12
    offset_of_tet = k >> 17
    leap_month = k & 0xf
    leap_month_length = month_lengths[(k >> 16) & 0x1]
    solar_ny = jdn(1, 1, yy)
    current_jd = solar_ny + offset_of_tet
    j = k >> 4
    ly = []
    for i in range(12):
        regular_months[11 - i] = month_lengths[j & 0x1]
        j >>= 1
    if leap_month == 0:
        for mm in range(1, 13):
            ly.append(LunarDate(1, mm, yy, 0, current_jd))
            current_jd += regular_months[mm - 1]
    else:
        for mm in range(1, leap_month + 1):
            ly.append(LunarDate(1, mm, yy, 0, current_jd))
            current_jd += regular_months[mm - 1]
        ly.append(LunarDate(1, leap_month, yy, 1, current_jd))
        current_jd += leap_month_length
        for mm in range(leap_month + 1, 13):
            ly.append(LunarDate(1, mm, yy, 0, current_jd))
            current_jd += regular_months[mm - 1]
    return ly
	

def _get_year_code(yyyy):
    """Return the encoded lunar-year table value for a supported year."""
    if 1800 <= yyyy <= 1899:
        return TK19[yyyy - 1800]
    if 1900 <= yyyy <= 1999:
        return TK20[yyyy - 1900]
    if 2000 <= yyyy <= 2099:
        return TK21[yyyy - 2000]
    if 2100 <= yyyy <= 2199:
        return TK22[yyyy - 2100]
    raise ValueError("Chỉ hỗ trợ từ năm 1800 đến 2199.")


def _get_encoded_month_length(yyyy, month, leap=0):
    """Return a lunar month length directly from the encoded year table."""
    if not 1 <= month <= 12:
        raise ValueError("Tháng âm lịch phải nằm trong khoảng 1-12.")

    year_code = _get_year_code(yyyy)
    leap_month = year_code & 0xF
    if leap:
        if month != leap_month:
            raise ValueError("Tháng được yêu cầu không phải tháng nhuận của năm này.")
        return 29 + ((year_code >> 16) & 0x1)

    return 29 + ((year_code >> (16 - month)) & 0x1)


@lru_cache(maxsize=400)
def get_year_info(yyyy):
    return decode_lunar_year(yyyy, _get_year_code(yyyy))


def find_lunar_date(jd, ly):
    if jd < ly[0].jd:
        return LunarDate(0, 0, 0, 0, jd)
    i = len(ly) - 1
    while jd < ly[i].jd:
        i -= 1
    offset = jd - ly[i].jd
    return LunarDate(ly[i].day + offset, ly[i].month, ly[i].year, ly[i].leap, jd)

def get_lunar_date(dd, mm, yyyy):
    jd = jdn(dd, mm, yyyy)
    try:
        ly = get_year_info(yyyy)
        if jd < ly[0].jd:
            ly = get_year_info(yyyy - 1)
        return find_lunar_date(jd, ly)
    except ValueError:
        return None

def get_year_can_chi(year):
    return f"{CAN[(year + 6) % 10]} {CHI[(year + 8) % 12]}"

def get_month_name(month, leap):
    name = MONTH_NAMES[month - 1] if 1 <= month <= 12 else f"Tháng {month}"
    return name + " (Nhuận)" if leap else name

def get_lunar_month_length(lunar_date):
    return _get_encoded_month_length(
        lunar_date.year, lunar_date.month, lunar_date.leap
    )

# ===== Các hàm tính toán mới =====

def sun_longitude(jd):
    T = (jd - 2451545.0) / 36525
    T2 = T * T
    dr = pi / 180
    M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2
    L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2
    DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * sin(dr * M)
    DL += (0.019993 - 0.000101 * T) * sin(2 * dr * M) + 0.000290 * sin(3 * dr * M)
    L = (L0 + DL) * dr
    L -= pi * 2 * INT(L / (pi * 2))
    return L

def get_sun_longitude_index(jd, time_zone=7.0):
    return INT(sun_longitude(jd - 0.5 - time_zone / 24.0) / pi * 12)

def get_tiet_khi(jd):
    # Dùng jd+1 để khớp với logic của file JS
    return TIETKHI[get_sun_longitude_index(jd + 1)]

def get_can_chi_day_month_year(lunar_date):
    if not lunar_date: return "", "", ""
    day_name = f"{CAN[(lunar_date.jd + 9) % 10]} {CHI[(lunar_date.jd + 1) % 12]}"
    month_name = f"{CAN[(lunar_date.year * 12 + lunar_date.month + 3) % 10]} {CHI[(lunar_date.month + 1) % 12]}"
    year_name = get_year_can_chi(lunar_date.year)
    return day_name, month_name, year_name

def get_can_hour_0(jd):
    return f"{CAN[((jd - 1) * 2) % 10]} {CHI[0]}"

def _format_gio_string(gio_str_indices):
    res = []
    for i in gio_str_indices:
        gio_chi = CHI[i]
        gio_emoji = CHI_EMOJI[i]
        gio_thoi_gian = f"({(i*2+23)%24}-{(i*2+1)%24}h)"
        res.append(f"{gio_chi} {gio_emoji} {gio_thoi_gian}")
    return ", ".join(res)

def get_gio_hoang_dao(jd):
    chi_of_day = (jd + 1) % 12
    gio_hd_pattern = GIO_HD[chi_of_day % 6]
    hoang_dao_indices = [i for i, char in enumerate(gio_hd_pattern) if char == '1']
    return _format_gio_string(hoang_dao_indices)

def get_gio_hac_dao(jd):
    chi_of_day = (jd + 1) % 12
    gio_hd_pattern = GIO_HD[chi_of_day % 6]
    hac_dao_indices = [i for i, char in enumerate(gio_hd_pattern) if char == '0']
    return _format_gio_string(hac_dao_indices)
    
def get_huong_xuat_hanh(jd):
    can_ngay = CAN[(jd + 9) % 10]
    chi_ngay = CHI[(jd + 1) % 12]
    can_chi_ngay = f"{can_ngay}{chi_ngay}"

    def find_direction(rules, can):
        for direction, cans in rules.items():
            if can in cans:
                return direction
        return "Không rõ"

    hy_than = find_direction(HY_THAN_RULES, can_ngay)
    tai_than = find_direction(TAI_THAN_RULES, can_ngay)

    if can_chi_ngay in HAC_THAN_FREE:
        hac_than = "Tránh xuất hành hướng Lên Trời gặp Hạc Thần (xấu)"
    else:
        hac_than = HAC_THAN_MAP.get(can_chi_ngay, "Không rõ")
        
    return {
        "Hỷ Thần": hy_than,
        "Tài Thần": tai_than,
        "Hạc Thần": hac_than
    }

def get_thap_nhi_truc(jd):
    TRUC_ORDER = ["Kiến", "Trừ", "Mãn", "Bình", "Định", "Chấp", "Phá", "Nguy", "Thành", "Thu", "Khai", "Bế"]
    # Bảng tra Chi của tháng theo Tiết khí
    month_chi_list = [3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,0,0,1,1,2,2,3]
    st_index = get_sun_longitude_index(jd, 7.0)
    month_chi_index = month_chi_list[st_index]
    day_chi_index = (jd + 1) % 12
    duty_index = (day_chi_index - month_chi_index + 12) % 12
    truc_name = TRUC_ORDER[duty_index]
    return {"name": truc_name, "details": THAP_NHI_TRUC.get(truc_name, {})}

def get_nhi_thap_bat_tu(jd):
    sao_names = list(NHI_THAP_BAT_TU.keys())
    jd_ref = 2451545  # JDN của 2000-01-01 12:00 UT
    mansion_ref_index = 16 # Vị trí của sao "Khuê" vào ngày tham chiếu
    day_diff = jd - jd_ref
    current_mansion_index = (mansion_ref_index + day_diff) % 28
    sao_name = sao_names[current_mansion_index]
    return {"name": sao_name, "details": NHI_THAP_BAT_TU.get(sao_name, {})}

def get_lunar_leap_info(yyyy):
    """Trả về tháng nhuận của năm âm lịch (kiểu số int). Trả về 0 nếu năm đó không nhuận."""
    try:
        ly = get_year_info(yyyy)
        for m in ly:
            if m.leap == 1:
                return m.month
        return 0
    except ValueError:
        return 0

def lunar_to_solar_extended(dd, mm, yyyy):
    """
    Trả về dictionary chứa các ngày dương lịch tương ứng với ngày âm lịch.
    Mỗi kết quả là một dict chứa ngay, thang, nam, ngay_duong_lich đầy đủ.
    """
    try:
        ly = get_year_info(yyyy)
        results = {}
        leap_month = 0
        
        for i in range(len(ly)):
            m_info = ly[i]
            if m_info.leap == 1:
                leap_month = m_info.month
                
            if m_info.month == mm:
                # Đọc trực tiếp độ dài tháng từ bảng mã năm, kể cả biên 2199.
                m_len = _get_encoded_month_length(
                    yyyy, m_info.month, m_info.leap
                )
                        
                if 1 <= dd <= m_len:
                    target_jd = m_info.jd + dd - 1
                    d, m, y = jd_to_date(target_jd)
                    key = "leap" if m_info.leap == 1 else "regular"
                    
                    results[key] = {
                        "ngay": int(d),
                        "thang": int(m),
                        "nam": int(y),
                        "ngay_duong_lich": f"{int(d)}/{int(m)}/{int(y)}" # LUÔN ĐẦY ĐỦ NGÀY/THÁNG/NĂM
                    }
                    
        return results, leap_month
    except Exception as e:
        raise ValueError(f"Lỗi tính toán: {str(e)}")

