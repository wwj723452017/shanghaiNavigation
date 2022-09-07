/**
 * 获取两经纬度之间的距离
 * @param {number} e1 点1的东经, 单位:角度, 如果是西经则为负
 * @param {number} n1 点1的北纬, 单位:角度, 如果是南纬则为负
 * @param {number} e2
 * @param {number} n2
 * 地球半径6371千米
 * 返回两点距离km
 */
 function getDistance(e1, n1, e2, n2){
    const R = 6371
    const { sin, cos, asin, PI, hypot } = Math
    
    /** 根据经纬度获取点的坐标 */
    let getPoint = (e, n) => {
        e *= PI/180
        n *= PI/180
        //这里 R* 被去掉, 相当于先求单位圆上两点的距, 最后会再将这个距离放大 R 倍
        return {x: cos(n)*cos(e), y: cos(n)*sin(e), z: sin(n)}
    }
    
    let a = getPoint(e1, n1)
    let b = getPoint(e2, n2)
    let c = hypot(a.x - b.x, a.y - b.y, a.z - b.z)
    let r = asin(c/2)*2*R
    return r
}