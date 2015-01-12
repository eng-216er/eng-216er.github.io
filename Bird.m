function [ y ] = Bird( x1, x2 )
%BIRD Summary of this function goes here
%   Detailed explanation goes here

y = sin(x1) .* exp( (1 - cos(x2) ).^2 ) +  ... 
    cos(x2) .* exp( ( 1 - sin(x1) ).^2 ) + (x1 - x2 ).^2;

end

