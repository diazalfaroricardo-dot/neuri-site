from PIL import Image, ImageDraw, ImageSequence
import os, glob
V="/home/claude/neuri-bazar/docs/ventas/"
S=(178,348); X,Y=376,28
mask=Image.new("L",S,0); ImageDraw.Draw(mask).rounded_rectangle([0,0,S[0]-1,S[1]+40],radius=24,fill=255)
def fit(fr):
  fr=fr.convert("RGB"); w=S[0]; h=int(fr.height*w/fr.width); fr=fr.resize((w,h),Image.LANCZOS)
  return fr.crop((0,0,w,S[1])) if h>=S[1] else fr
def gif_frames(path, maxf=40):
  im=Image.open(path); fr=[]; du=[]
  n=im.n_frames; step=max(1,round(n/maxf))
  for i,f in enumerate(ImageSequence.Iterator(im)):
    if i%step==0: fr.append(f.copy()); du.append(im.info.get('duration',100)*step)
  return fr,du
def slides(paths, hold=1400, fade=4):
  imgs=[fit(Image.open(p)) for p in paths]; fr=[]; du=[]
  for i,a in enumerate(imgs):
    b=imgs[(i+1)%len(imgs)]
    fr.append(a); du.append(hold)
    for k in range(1,fade+1):
      fr.append(Image.blend(a,b,k/(fade+1))); du.append(60)
  return fr,du
def build(prod,lang,frames,durs,out):
  bg=Image.open(f"hero/bg-{prod}-{lang}.png").convert("RGB")
  outs=[]
  for f in frames:
    c=bg.copy(); sc=fit(f) if f.size!=S else f
    c.paste(sc,(X,Y),mask.crop((0,0,sc.width,sc.height)))
    outs.append(c.quantize(colors=128,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE))
  outs[0].save(out,save_all=True,append_images=outs[1:],duration=durs,loop=0,optimize=True,disposal=1)
  print(out, os.path.getsize(out)//1024,"KB", len(outs),"frames")
os.makedirs("heroout",exist_ok=True)
for l in ["es","en"]:
  fr,du=gif_frames(V+f"neuri-bots-demo-{l}.gif",36); build("bots",l,[fit(f) for f in fr],du,f"heroout/bots-{l}.gif")
  fr,du=gif_frames(V+f"neuri-consulting-demo-{l}.gif",36); build("consulting",l,[fit(f) for f in fr],du,f"heroout/consulting-{l}.gif")
  fr,du=slides(sorted(glob.glob(f"hero/mkt-{l}-*.png"))); build("marketing",l,fr,du,f"heroout/marketing-{l}.gif")
fr,du=gif_frames(V+"neuri-bazar-demo-en.gif",40); build("bazar","en",[fit(f) for f in fr],du,"heroout/bazar-en.gif")
R="/home/claude/neuri-site/bazar/recorrido/img/"
fr,du=slides([R+"03-390-inicio.jpg",R+"04-390-puestos.jpg",R+"06-390-caja-venta.jpg",R+"09-390-mi-puesto.jpg"]); build("bazar","es",fr,du,"heroout/bazar-es.gif")
