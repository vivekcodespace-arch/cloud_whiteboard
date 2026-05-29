// a single point
export interface point{
    x: number,
    y: number
}

export interface stroke{
    points: point[],
    color: string,
    width: number
}


export interface viewport{
    panX : number,
    panY : number,
    
    scale : number
}

