import { ui } from "./../ui/layaMaxUI";
/**
 * 本示例采用非脚本的方式实现，而使用继承页面基类，实现页面逻辑。在IDE里面设置场景的Runtime属性即可和场景进行关联
 * 相比脚本方式，继承式页面类，可以直接使用页面定义的属性（通过IDE内var属性定义），比如this.tipLbll，this.scoreLbl，具有代码提示效果
 * 建议：如果是页面级的逻辑，需要频繁访问页面内多个元素，使用继承式写法，如果是独立小模块，功能单一，建议用脚本方式实现，比如子弹脚本。
 */
import Vector2 = Laya.Vector2;
import PolygonDetect, { Polygon } from "./PloygenDetection";

export default class GameUI extends ui.test.TestSceneUI {

    point:Laya.Sprite;
    Line:Laya.Sprite;


    constructor() {
        super();
		
        //添加3D场景
        var scene: Laya.Scene3D = Laya.stage.addChild(new Laya.Scene3D()) as Laya.Scene3D;

        let posArr = [300,300,500,300,500,600,300,600,300,300];
        this.DrawPolygen(posArr);

        let posArr2 = [400,400,600,400,600,800,400,800,400,400];
        this.DrawPolygen(posArr2);

        let posArr3 = [800,400,1000,400,1000,800,800,800,800,400];
        this.DrawPolygen(posArr3);

        this.ShowResult(PolygonDetect.IsRectPolygonIntersect(this.CreatePolygon(posArr),this.CreatePolygon(posArr3)));


        // let posArr = [300,200,500,240,600,400,340,800,100,400,300,200];
        // this.DrawPolygen(posArr);

        // let posArr2 = [1000,300,800,400,600,800,1200,500,1000,300]
        // this.DrawPolygen(posArr2);

        // this.ShowResult(PolygonDetect.IsMultiPolygonIntersection(this.CreatePolygon(posArr),this.CreatePolygon(posArr2)));

        // let posArr3 = [1000,300,1200,600,1500,100,1600,700,1000,300]
        // this.DrawPolygen(posArr3);

        // this.Line = this.CreateSprite();
        // this.point = this.CreateSprite();
        // Laya.stage.on(Laya.Event.MOUSE_MOVE,this,()=>{
        //     this.Line.graphics.clear();
        //     this.point.graphics.clear();
        //     this.IsIntersect(this.Line,posArr2); 
        //     this.IsInPolygon(this.point,posArr2);     
        // })

    }

    IsInPolygon(sp:Laya.Sprite,posArr: Array<number>){
        sp.graphics.drawCircle(Laya.stage.mouseX,Laya.stage.mouseY,5,"#00ff00");
        let b = PolygonDetect.IsPointInPolygon(new Laya.Vector2(Laya.stage.mouseX,Laya.stage.mouseY),this.CreatePolygon(posArr));
        this.ShowResult(b);
    }

    currentPoint:number;
    IsIntersect(sp:Laya.Sprite,posArr: Array<number>){
        let p1 = new Vector2(Laya.stage.width/2,Laya.stage.height/2);
        let p2 = new Vector2(Laya.stage.mouseX,Laya.stage.mouseY);
        sp.graphics.drawLine(p1.x,p1.y,p2.x,p2.y,"#00ff00");
        let b1;
        let index =0;
        for(let i=0;i<posArr.length;i+=2){
            let q1 = new Vector2(posArr[i],posArr[i+1]);
            let q2 = new Vector2(posArr[i+2],posArr[i+3]);
            if(i != posArr.length -2){
                b1 = PolygonDetect.IsSegmentIntersect(p1,p2,q1,q2);
                if(b1){
                    this.ShowResult(b1);
                    index++;
                    console.debug("相交的线段为" + index + "：" ,q1.x,q1.y,q2.x,q2.y);
                    if(this.currentPoint==null && this.currentPoint!=i){
                        this.point = this.CreateSprite();
                        this.currentPoint = i;
                    }
                    this.CreateIntersectPoint(this.point,p1,p2,q1,q2);
                }
            }else{
                q2 = new Vector2(posArr[0],posArr[1]);
                b1 = PolygonDetect.IsSegmentIntersect(p1,p2,q1,q2);
                if(b1){
                    this.ShowResult(b1);
                    index++;
                    console.debug("相交的线段为" + index + "：" ,q1.x,q1.y,q2.x,q2.y);
                    let sp2;
                    if(this.currentPoint==null && this.currentPoint!=i){
                        sp2 = this.CreateSprite();
                        this.currentPoint = i;
                    }
                    this.CreateIntersectPoint(sp2,p1,p2,q1,q2);
                }
            }
        }
        if(index==0) this.ShowResult(false);
    }

    CreateIntersectPoint(sp:Laya.Sprite, p1,p2,q1,q2){
        if(sp==null)return ;
        let p = PolygonDetect.GetCrossPoint(p1,p2,q1,q2);
        sp.graphics.clear();
        if(p)
        sp.graphics.drawCircle(p.x,p.y,10,"#0000ff");
    }

    CreateSprite(){
        let sp = new Laya.Sprite();
        Laya.stage.addChild(sp);
        return sp;
    }

    CreatePolygon(arr:Array<number>){
        let _arr = new Array<Vector2>();
        for(let i = 0;i<arr.length;i+=2){
            if(i!=arr.length -1){
                _arr.push(new Vector2(arr[i],arr[i+1]));
                this.CreateLable("("+arr[i]+","+arr[i+1]+")", new Vector2(arr[i],arr[i+1]));
            }else{
                _arr.push(new Vector2(arr[i],arr[0]));
                this.CreateLable("("+arr[i]+","+arr[0]+")", new Vector2(arr[i],arr[i+1]));
            }
        }
        let polygon = new Polygon(_arr);
        return polygon;
    }

    DrawPolygen(posArr:Array<any>,color?:string,lineWidth?:number){
        let sp = new Laya.Sprite();
        Laya.stage.addChild(sp);

        let _color = color!=null?color:"#ff0000";
        let _width = lineWidth!=null?lineWidth:5;

        let startPos = new Vector2(0,0);
        sp.graphics.drawLines(startPos.x,startPos.y,posArr,_color,_width); 
    }

    CreateLable(content:string,pos:Laya.Vector2){
        var label = new Laya.Label();
        label.name = "text";
        label.width = 100;
        label.height = 100;
        label.pivotX = 50;
        label.pivotY = 50;
        label.pos(pos.x,pos.y);
        label.bold = true;
        label.font = "SimHei";
        label.text = content;
        label.fontSize = 20;
        label.align = "center";
        label.valign = "middle";
        label.color = "#ffffff";
        Laya.stage.addChild(label);
        return label;
    }

    ShowResult(b:boolean){
        let label = this.getChildByName("msg") as Laya.Label;
        if(b){
            if(label)label.text = "相交";
        }else{
            if(label)label.text = "不相交";
        }
    }
}