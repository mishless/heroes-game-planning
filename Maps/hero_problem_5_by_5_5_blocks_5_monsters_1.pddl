(define (problem hero-problem) 
(:domain heroes-world) 
(:objects p0 p1 p2 p3 p4 p5 p6 p7 p8 p9 p10 p12 p13 p15 p17 p18 p19 p20 p21 p22 p23 p24  - location 
h - hero 
m00  - m0 
w0 - w0 
m10  - m1 
w1 - w1 
m20  - m2 
w2 - w2 
m30  - m3 
w3 - w3 
m40  - m4 
w4 - w4 
) 
(:init (at h p1) (at m00 p7) (guarded p7) 
(at w0 p8) 
(at m10 p19) (guarded p19) 
(at w1 p9) 
(at m20 p6) (guarded p6) 
(at w2 p0) 
(at m30 p13) (guarded p13) 
(at w3 p18) 
(at m40 p3) (guarded p3) 
(at w4 p22) 
(adjacent p0 p5) 
(adjacent p0 p1) 
(adjacent p1 p6) 
(adjacent p1 p0) 
(adjacent p1 p2) 
(adjacent p2 p7) 
(adjacent p2 p1) 
(adjacent p2 p3) 
(adjacent p3 p8) 
(adjacent p3 p2) 
(adjacent p3 p4) 
(adjacent p4 p9) 
(adjacent p4 p3) 
(adjacent p5 p0) 
(adjacent p5 p10) 
(adjacent p5 p6) 
(adjacent p6 p1) 
(adjacent p6 p5) 
(adjacent p6 p7) 
(adjacent p7 p2) 
(adjacent p7 p12) 
(adjacent p7 p6) 
(adjacent p7 p8) 
(adjacent p8 p3) 
(adjacent p8 p13) 
(adjacent p8 p7) 
(adjacent p8 p9) 
(adjacent p9 p4) 
(adjacent p9 p8) 
(adjacent p10 p5) 
(adjacent p10 p15) 
(adjacent p12 p7) 
(adjacent p12 p17) 
(adjacent p12 p13) 
(adjacent p13 p8) 
(adjacent p13 p18) 
(adjacent p13 p12) 
(adjacent p15 p10) 
(adjacent p15 p20) 
(adjacent p17 p12) 
(adjacent p17 p22) 
(adjacent p17 p18) 
(adjacent p18 p13) 
(adjacent p18 p23) 
(adjacent p18 p17) 
(adjacent p18 p19) 
(adjacent p19 p24) 
(adjacent p19 p18) 
(adjacent p20 p15) 
(adjacent p20 p21) 
(adjacent p21 p20) 
(adjacent p21 p22) 
(adjacent p22 p17) 
(adjacent p22 p21) 
(adjacent p22 p23) 
(adjacent p23 p18) 
(adjacent p23 p22) 
(adjacent p23 p24) 
(adjacent p24 p19) 
(adjacent p24 p23) 
) (:goal (and (has-castle p7) (has-castle p19) (has-castle p6) (has-castle p13) (has-castle p3) )))