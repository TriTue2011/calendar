"""Tìm (tâm c, biên độ a) từng chân sao cho: bước so le (pha 0; 0,25; 0,5; 0,75), quãng di chuyển 4 chân gần bằng nhau, bàn chân gần–xa cùng cặp không chồng nhau.
Dùng ĐÚNG công thức động học thuận của lich-bloc-xua-xuong.js (viTriBanChan)."""
import json, math, itertools, sys
import numpy as np
cfg=json.load(open("repos2/cal-dich/custom_components/lich_viet/frontend/xuong/cho.json",encoding="utf-8"))
DUTY=cfg["duty"]; GOI=float(sys.argv[2]) if len(sys.argv)>2 else cfg["goi"]
def dang(phi):
    phi%=1
    if phi<DUTY: return 1-2*phi/DUTY,0.0,1
    s=(phi-DUTY)/(1-DUTY); e=s*s*(3-2*s); return -1+2*e,GOI*math.sin(math.pi*s**0.75),0
def xoay(a,x,y): c,s=math.cos(a),math.sin(a); return c*x-s*y,s*x+c*y
def paw(g,c,a,ph,t):
    sh,fl,st=dang(t+ph); rest=math.atan2(g["paw"][0]-g["hip"][0],g["paw"][1]-g["hip"][1]); th=-(c+a*sh-rest)
    sig=1/max(0.92,math.cos(th)) if st else 1
    dx,dy=xoay(fl,g["paw"][0]-g["knee"][0],g["paw"][1]-g["knee"][1]); sx,sy=g["knee"][0]-g["hip"][0]+dx,g["knee"][1]-g["hip"][1]+dy
    fx,fy=xoay(th,sx,sig*sy); return g["hip"][0]+fx
G={("xa","sau"):None,("chinh","sau"):None,("chinh","truoc"):None,("xa","truoc"):None}
for lop in ("xa","chinh"):
    for g in cfg[lop]["chan"]: G[(lop,g["ten"])]=g
PH={("chinh","sau"):0.0,("chinh","truoc"):0.25,("xa","sau"):0.5,("xa","truoc"):0.75}
T=np.arange(240)/240
def serie(k,c,a): return np.array([paw(G[k],c,a,PH[k],t) for t in T])
RONG={("chinh","sau"):98,("xa","sau"):90,("chinh","truoc"):102,("xa","truoc"):94}
muc=float(sys.argv[1]) if len(sys.argv)>1 else 110.0
def tim(k,cs):
    ra={}
    for c in cs:
        # a sao cho quãng di chuyển ≈ muc
        lo,hi=0.02,0.45
        for _ in range(30):
            m=(lo+hi)/2; s=serie(k,c,m)
            if s.max()-s.min()<muc: lo=m
            else: hi=m
        ra[c]=(m,serie(k,c,m))
    return ra
cs={("xa","sau"):np.arange(-0.50,-0.10,0.025),("chinh","sau"):np.arange(-0.05,0.25,0.025),("chinh","truoc"):np.arange(-0.10,0.25,0.025),("xa","truoc"):np.arange(0.20,0.70,0.025)}
op={k:tim(k,cs[k]) for k in cs}
tot=None
for csau_xa,csau_gan,ct_gan,ct_xa in itertools.product(*[list(op[k].keys()) for k in [("xa","sau"),("chinh","sau"),("chinh","truoc"),("xa","truoc")]]):
    a1=op[("xa","sau")][csau_xa][1]; a2=op[("chinh","sau")][csau_gan][1]; a3=op[("chinh","truoc")][ct_gan][1]; a4=op[("xa","truoc")][ct_xa][1]
    gs=np.min(np.abs(a2-a1))-(RONG[("chinh","sau")]+RONG[("xa","sau")])/2; gt=np.min(np.abs(a3-a4))-(RONG[("chinh","truoc")]+RONG[("xa","truoc")])/2
    # ưu tiên: không chồng (gs,gt ≥ 15 px), càng ít lệch khỏi tư thế ảnh gốc (|c - góc nghỉ|) càng tốt, tránh chân xa dạng sẵn quá
    REST={'xa_sau':-0.413,'chinh_sau':0.126,'chinh_truoc':0.095,'xa_truoc':0.600}
    lech=abs(csau_xa-REST['xa_sau'])+abs(csau_gan-REST['chinh_sau'])+abs(ct_gan-REST['chinh_truoc'])+abs(ct_xa-REST['xa_truoc'])
    if gs>=15 and gt>=15:
        sc=lech
        if tot is None or sc<tot[0]: tot=(sc,csau_xa,csau_gan,ct_gan,ct_xa,gs,gt)
if tot is None: print("không có nghiệm với quãng", muc); sys.exit(1)
_,c1,c2,c3,c4,gs,gt=tot
out={}
for k,c in zip([("xa","sau"),("chinh","sau"),("chinh","truoc"),("xa","truoc")],[c1,c2,c3,c4]):
    a=op[k][c][0]; s=op[k][c][1]; out[k]=(round(c,3),round(a,3)); print(k,"c=%.3f a=%.3f quãng %.0f px"%(c,a,s.max()-s.min()))
print("khe nhỏ nhất so với bề ngang chân: cặp sau %+.0f px, cặp trước %+.0f px (phần dư sau khi trừ bề ngang)"%(gs,gt))
json.dump({"|".join(k):v for k,v in out.items()},open("cat/dang_di_tim_duoc.json","w"))
