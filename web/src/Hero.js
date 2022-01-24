import './Hero.css'
import Sketch from 'react-p5'
import { useState, useEffect } from 'react'
let i=0
export default function Hero() {
  const [startTime, setStartTime] = useState(0)
  // const [startTimeOffset, setStartTimeOffset] = useState(0)

  // useEffect(() => {
  //   setStartTime(Date.now())
  // }, [])

  // useEffect(() =>
  //   window.addEventListener('resize', () => {
  //     const x = Date.now()
  //     // debugger
  //     setStartTimeOffset(Date.now() - startTime)
  //   }), [startTime]
  // )


  const setup = (p5, canvasRef) => {
    p5.createCanvas(window.innerWidth, window.innerHeight*2).parent(canvasRef)
  }

  const draw = p5 => {
    p5.noLoop()
    p5.noStroke()
    p5.colorMode(p5.HSL, 360, 100, 100, 100)


    // if (Date.now() - (startTime + startTimeOffset) < 100) {
    //   p5.clear()
    //   for (let i = 0; i < startTimeOffset; i++) {
    //     p5.circle(i/10 ,0,20)
    //   }

    // }

    const a = 40
    const colors = [
      // p5.color(42, 88, 73, a),
      // p5.color(44, 13, 60, a),
      p5.color(47, 95, 70, a),
      p5.color(15, 63, 61, a),
      // p5.color(108, 44, 64, a),
      // p5.color(124, 54, 76, a),
      p5.color(168, 23, 71, a),
      p5.color(221, 48, 70, a),
    ]


    times(300, i => {

      const x = p5.random(0, p5.width)
      const y = (p5.random() ** 3) * p5.height - 25
      const cix = p5.noise(x/100, y/100)

      let c

      if (cix < 0.3) c = colors[0]
      else if (cix < 0.5) c = colors[1]
      else if (cix < 0.75) c = colors[2]
      else if (cix < 1) c = colors[3]
      // else if (cix < 1) c = colors[4]
      // const cix = p5.int(
      //   p5.map(
      //     0,
      //     1,
      //     0,
      //     4
      //   )
      // )
      // const cix = p5.int(p5.random(colors.length))
      // const c = colors[cix]
      p5.fill(c)
      // p5.circle(200, 200, 50)
      // p5.circle(
      //   x,
      //   y,
      //   p5.random(3, 20)
      // )

      noiseCircle(p5, x, y, p5.random(3, 20))
    })

    p5.translate(p5.width/2, p5.height/2)

    // times(60, i => {

    //   const pos = p5.random(0.00001, 0.00005) * (p5.random() < 0.5 ? 1 : -1)
    //   const neg = p5.random(0.00001, 0.0001) * (p5.random() < 0.5 ? -1 : 1)

    //   const direction = p5.random() < 0.5 ? 1 : -1

    //   drawCurve(p5, 0, 0, 3200, p5.HALF_PI * direction, (angleD, i, points) => {
    //     if (i < 600) {
    //       return angleD + pos
    //     } else {
    //       return angleD + neg
    //     }
    //   })
    // })






      // angle += p5.map(
      //   p5.noise((x+100)/50, (y+100)/50),
      //   0,
      //   1,
      //   0,
      //   p5.PI/20
      // )

  }

  return (
    <Sketch setup={setup} draw={draw} className="Hero" />
  )
}

// const iden = x => x
// const defaultThick = i => 1+(i/40)
// function drawCurve(p5, startX, startY, startAngle, len, colorFn, thickFn=defaultThick, changeFn=iden) {
//   let angle = startAngle
//   let angleChange = Math.PI/1600

//   let x = startX
//   let y = startY

//   let i = 0
//   while (i < len) {
//   // while (i < len && angleChange < PI && angleChange > -PI) {
//     p5.fill(colorFn(i, len))
//     p5.circle(x, y, thickFn(i))
//     ;([x, y] = getXYRotation(angle, 1, x, y))

//     angle += angleChange
//     angleChange = changeFn(angleChange, i, len)
//     i++
//   }
// }



function noiseCircle(p5, _x, _y, rad) {
  const shapePointCount = 30
  const shapeNoiseDivisor = 2

  const shapeCoords = times(shapePointCount, point => {
    const p = (point + shapePointCount) % shapePointCount
    const progress = p * p5.TWO_PI / shapePointCount

    const coords = getXYRotation(progress, 2, _x+1000, _y+1000)
    const __x = (coords[0] + 200)/shapeNoiseDivisor
    const __y = (coords[1] + 200)/shapeNoiseDivisor
    const _z = 1/shapeNoiseDivisor
    const _r = p5.map(p5.noise(__x, __y, _z), 0, 1, rad*0.5, rad*2)

    return getXYRotation(
      progress,
      _r,
      _x,
      _y,
    )
  })


  p5.beginShape()
  p5.curveVertex(...shapeCoords[shapeCoords.length - 1])
  shapeCoords.forEach(([x, y]) => {
    p5.curveVertex(x, y)
  })
  p5.curveVertex(...shapeCoords[0])
  p5.curveVertex(...shapeCoords[1])
  p5.endShape()

}



const drawCurve = (p5, startX, startY, points, startAngle, changeFn) => {
  const colors = [
    p5.color(15, 63, 51),
    p5.color(42, 88, 73),
    // p5.color(44, 13, 60),
    p5.color(52, 95, 70),
    p5.color(108, 24, 64),
    p5.color(124, 54, 76),
    p5.color(168, 23, 71),
    p5.color(221, 38, 80),
  ]
  const cix = p5.int(p5.random(colors.length))
  const c = colors[cix]
  // const c = p5.color('red')

  let angle = startAngle
  let angleD = Math.PI/1600

  let x = startX
  let y = startY


  for (let i = 0; i < points; i++) {
    p5.fill(p5.color(
      p5.hue(c),
      p5.saturation(c),
      83,
      p5.map(i/points, 0, 1, 0, 100)
    ))

    p5.circle(x, y, (3 + i/15) * p5.random(0.3, 1.1))

    ;([x, y] = getXYRotation(angle, 1, x, y))

    angle += angleD
    angleD = changeFn(angleD, i, points)
    // console.log(angle, angleD)
  }


  // const posRate = p5.random(-0.0001, 0.0001)
  // const negRate = p5.random(-0.0001, 0.0001)

  // const changeRate = p5.random(0.992, 1.008)
  // const direction = p5.random() < 0.5 ? 1 : -1

  // let angle = p5.random(0, p5.TWO_PI)
  // // let angle = (p5.random() < 0.5 ? p5.HALF_PI : -p5.HALF_PI)
  // let x = 0
  // let y = 0

  // // const switchPoint = p5.random(0.3, 0.8)
  // const points = 400
  // times(points, i => {
  //   // if (angleD >= p5.PI) return




  //   ;([x, y] = getXYRotation(angle, 1, x, y))
  //   // angle += p5.map(
  //   //   p5.noise((x+100)/300, (y+100)/300),
  //   //   0,
  //   //   1,
  //   //   0,
  //   //   p5.PI/100
  //   // )
  //   angle += angleD

  //   // angleD = p5.abs(angleD * changeRate) * direction



  //   // angleD += 0.00005
  //   if (i/points < switchPoint) {
  //     angleD += posRate
  //   } else {
  //     angleD += negRate
  //   }

  // })
}

function getXYRotation (deg, radius, cx=0, cy=0) {
  return [
    Math.sin(deg) * radius + cx,
    Math.cos(deg) * radius + cy,
  ]
}

function times(t, fn) {
  const out = []
  for (let i = 0; i < t; i++) out.push(fn(i))
  return out
}

const hfix = h => Math.floor((h + 360)) % 360

