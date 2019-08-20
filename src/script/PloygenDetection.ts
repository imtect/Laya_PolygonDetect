import Vector2 = Laya.Vector2;

/** 
 * 参考https://blog.csdn.net/stevenkylelee/article/details/88075814
 * 
*/
export default class PolygonDetect{

    /**
     * 特殊情况，两个矩形是否相交
     * @param polygon1 
     * @param polygon2 
     */
    public static IsRectPolygonIntersect(polygon1:Polygon,polygon2:Polygon){
        return this.PointInPolygon(polygon1, polygon2);
    }

    /**
     * 判断两个多边形是否相交,(1)包含情况（2）完全不想交（3）相交
     * 判断条件：点在内部，边相交
     * @param Polygon1 多边形1
     * @param Polygon2 多边形2
     */
    public static IsMultiPolygonIntersection(Polygon1:Polygon,Polygon2:Polygon):boolean{
        return this.SegementDetect(Polygon1,Polygon2) || this.PointInPolygon(Polygon1, Polygon2);
    }

    /**
     * 判断点是否在多边形内部
     * 几种特殊情况，（1）点在边上 （2）边不是水平的 （3）多边形顶点与目标点相交，属于纵坐标较大的顶点则计数，否则忽略
     * @param point 点
     * @param Polygon 多边形
     */
    public static IsPointInPolygon(point:Vector2,Polygon:Polygon):boolean{
        let pointArr:Array<Vector2> = new Array<Vector2>();
        let lenght = Polygon.points.length;
        for(let i = 0;i < lenght;i++){
            let pt1 = Polygon.points[i];
            let pt2;
            if(i == lenght -1)
                pt2 = Polygon.points[0];
            else
                pt2 = Polygon.points[i+1];
          
            if(pt1.y==point.y&&pt2.y==point.y)continue;//射线与多边形线段重合
            if(pt1.y==point.y){ //射线与多边形某个线段初始顶点相交
                let pt0 = i==0?Polygon.points[lenght-1]:Polygon.points[i-1]
                if((pt0.y-pt1.y)*(pt2.y-pt1.y)>0){
                    continue;
                }else{
                    i++;
                }
            }
            if(pt2.y==point.y){ //射线与多边形某个线段结束顶点相交
                let pt3 = i==lenght-2?Polygon.points[0]:i==lenght-1?Polygon.points[1]:Polygon.points[i+2];
                if((pt1.y-pt2.y)*(pt3.y-pt2.y)>0){
                    continue;
                }else{
                    i++;
                }
            }

            let c = this.GetCrossPoint(pt1,pt2,point,new Vector2(Laya.stage.width,point.y));
            if(c!=null&&c.x > point.x){  
                if(!pointArr.some((p)=>p.x == c.x&&p.y == c.y)){
                    pointArr.push(c);
                }
            }
        }
        if(pointArr.length%2==1)
            return true;
        return false;
    }


    /**
     * "快速排斥":以两条线段为对角线的矩形，如果不重合，两线段一点不相交；aabb包围盒是否相交
     * "跨立实验"：如果两个线段相交，必须跨立，以一条线段为基准，另一条线段两端点一定在这条线段两侧，利用向量叉积
     * 线段平行重合的情况暂时未考虑
     */
    public static IsSegmentIntersect(p1:Vector2,p2:Vector2,q1:Vector2,q2:Vector2){
        //快速排斥
        let rect = Math.min(p1.x,p2.x) <= Math.max(q1.x,q2.x) &&
                   Math.min(q1.x,q2.x) <= Math.max(p1.x,p2.x) &&
                   Math.min(p1.y,p2.y) <= Math.max(q1.y,q2.y) &&
                   Math.min(q1.y,q2.y) <= Math.max(p1.y,p2.y)

        //跨立实验
        //q1,q2跨立线段p1p2
        let r1 = this.SegmentDetect(this.sub(p2,p1),this.sub(q1,p1),this.sub(q2,p1));
        //p1,p2跨立线段q1q2
        let r2 = this.SegmentDetect(this.sub(q2,q1), this.sub(p1,q1),this.sub(p2,q1));

        if(rect&&r1&&r2)
            return true;
        return false;
    }

    public static CreatePolygon(arr:Array<number>){
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

    private static CreateLable(content:string,pos:Laya.Vector2){
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

    /**
     * 多边形的点再另一个多边形内部
     * @param polygon1 
     * @param polygon2 
     */
    private static PointInPolygon(polygon1:Polygon,polygon2:Polygon){
        for( let i = 0 ; i < polygon1.points.length ; ++i ) {
            let pt = polygon1.points[i] ; 
            let b = this.IsPointInPolygon(pt,polygon2);
            if(b) return b; 
        }

        for( let i = 0 ; i < polygon2.points.length ; ++i ) {
            let pt = polygon2.points[i] ; 
            let b = this.IsPointInPolygon(pt,polygon1);
            if(b) return b; 
        }

        return false ; 
    }

    /**
     * 多边形的线段与另一个多边形线段相交
     * @param polygon1 
     * @param polygon2 
     */
    private static SegementDetect(polygon1:Polygon,polygon2:Polygon){
        // 线段相交
        for( let i = 0 ; i < polygon1.points.length; ++i ){
            let seg1pt1 = polygon1.points[i]; 
            let seg1pt2 = polygon1.points[i+1];
            if(i==polygon1.points.length-1){
                seg1pt2 = polygon1.points[0];
            }     
            for( let j = 0 ; j < polygon2.points.length; ++j ){
                let seg2pt1 = polygon2.points[j] ; 
                let seg2pt2 = polygon2.points[j+1] ; 
                if(j==polygon2.points.length-1){
                    seg2pt2 = polygon2.points[0];
                }    
                let b= this.IsSegmentIntersect(seg1pt1,seg1pt2,seg2pt1,seg2pt2);
                if(b) return b;
            }
        } 
        return false ; 
    }

    /**
     * 求两个线段的交点
     * @param seg1 
     * @param seg2 
     */
    public static GetCrossPoint(p1:Vector2,p2:Vector2,q1:Vector2,q2:Vector2){
        if(!this.IsSegmentIntersect(p1,p2,q1,q2)) return null;

        var area_abc = (p1.x - q1.x) * (p2.y - q1.y) - (p1.y - q1.y) * (p2.x - q1.x); 
        var area_abd = (p1.x - q2.x) * (p2.y - q2.y) - (p1.y - q2.y) * (p2.x - q2.x); 
        var area_cda = (q1.x - p1.x) * (q2.y - p1.y) - (q1.y - p1.y) * (q2.x - p1.x); 
        var area_cdb = area_cda + area_abc - area_abd ; 

        //计算交点坐标 
        var t = area_cda / ( area_abd- area_abc ); 
        var dx= t*(p2.x - p1.x), 
        dy= t*(p2.y - p1.y); 

        return new Vector2(p1.x + dx,p1.y + dy);
    }


    /**
     * 线段相交检测
     * @param p 线段0
     * @param p1 线段1
     * @param p2 线段2
     */
    private static SegmentDetect(p:Vector2, p1:Vector2,p2:Vector2):boolean{
        let c1:number = this.cross(p,p1);
        let c2:number = this.cross(p,p2);
        //如果在左右两边，相乘为负数
        if(c1 * c2 <= 0) return true;
        return false;
    }

    /**
     * 向量差乘
     * @param v1 向量1
     * @param v2 向量2
     */
    private static cross(v1:Vector2,v2:Vector2){
        return v1.x * v2.y - v2.x * v1.y;
    }

    /**
     * 向量相减
     * @param v1 向量1
     * @param v2 向量2
     */
    private static sub(v1:Vector2,v2:Vector2):Vector2{
        return new Vector2(v1.x - v2.x, v1.y - v2.y);
    }

}

export class Segment{
    public point1:Vector2;
    public point2:Vector2;
    constructor(_point1:Vector2,_point2:Vector2){
        this.point1 = _point1;
        this.point2 = _point2;
    }
}

export class Polygon{
    public points:Array<Vector2>;
    constructor(_points:Array<Vector2>){
        this.points = _points;
    }
}
