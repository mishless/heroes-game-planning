(define (problem hero-problem) 
(:domain heroes-world) 
(:objects p0 p1 p2 p3 p4 p5 p6 p7 p8 p9 p10 p11 p13 p14 p15 p16 p18 p19 p20 p21 p22 p23 p24 p25 p26 p27 p28 p29  - location 
h - hero 
m00  - m0 
w0 - w0 
) 
(:init (at h p0) (at m00 p5) (guarded p5) 
(at w0 p19) 
(adjacent p0 p6) 
(adjacent p0 p1) 
(adjacent p1 p7) 
(adjacent p1 p0) 
(adjacent p1 p2) 
(adjacent p2 p8) 
(adjacent p2 p1) 
(adjacent p2 p3) 
(adjacent p3 p9) 
(adjacent p3 p2) 
(adjacent p3 p4) 
(adjacent p4 p10) 
(adjacent p4 p3) 
(adjacent p4 p5) 
(adjacent p5 p11) 
(adjacent p5 p4) 
(adjacent p6 p0) 
(adjacent p6 p7) 
(adjacent p7 p1) 
(adjacent p7 p13) 
(adjacent p7 p6) 
(adjacent p7 p8) 
(adjacent p8 p2) 
(adjacent p8 p14) 
(adjacent p8 p7) 
(adjacent p8 p9) 
(adjacent p9 p3) 
(adjacent p9 p15) 
(adjacent p9 p8) 
(adjacent p9 p10) 
(adjacent p10 p4) 
(adjacent p10 p16) 
(adjacent p10 p9) 
(adjacent p10 p11) 
(adjacent p11 p5) 
(adjacent p11 p10) 
(adjacent p13 p7) 
(adjacent p13 p19) 
(adjacent p13 p14) 
(adjacent p14 p8) 
(adjacent p14 p20) 
(adjacent p14 p13) 
(adjacent p14 p15) 
(adjacent p15 p9) 
(adjacent p15 p21) 
(adjacent p15 p14) 
(adjacent p15 p16) 
(adjacent p16 p10) 
(adjacent p16 p22) 
(adjacent p16 p15) 
(adjacent p18 p24) 
(adjacent p18 p19) 
(adjacent p19 p13) 
(adjacent p19 p25) 
(adjacent p19 p18) 
(adjacent p19 p20) 
(adjacent p20 p14) 
(adjacent p20 p26) 
(adjacent p20 p19) 
(adjacent p20 p21) 
(adjacent p21 p15) 
(adjacent p21 p27) 
(adjacent p21 p20) 
(adjacent p21 p22) 
(adjacent p22 p16) 
(adjacent p22 p28) 
(adjacent p22 p21) 
(adjacent p22 p23) 
(adjacent p23 p29) 
(adjacent p23 p22) 
(adjacent p24 p18) 
(adjacent p24 p25) 
(adjacent p25 p19) 
(adjacent p25 p24) 
(adjacent p25 p26) 
(adjacent p26 p20) 
(adjacent p26 p25) 
(adjacent p26 p27) 
(adjacent p27 p21) 
(adjacent p27 p26) 
(adjacent p27 p28) 
(adjacent p28 p22) 
(adjacent p28 p27) 
(adjacent p28 p29) 
(adjacent p29 p23) 
(adjacent p29 p28) 
) (:goal (and (has-castle p5) )))