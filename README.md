# Sinumerik post for probing

This CNC probing program is designed to facilitate point probing operations on CNC machines. The program is written in JS language and is capable of translating apt to Sinumerik G-code.

## Description

The program takes an aptsource file.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/AleksiDu/PP_ATC.git
   ```

2. Navigate to the project directory:

   ```bash
   cd PP_ATC
   mkdir Input
   mkdir Output
   ```

3. Run the program:

   ```bash
   npm start
   ```

## Usage

Modify the `inputFile` with your file name. Then run the program using Node.js.

## Example

```APTsource
PROBE/POINTS,MMPM,  500.000000,DIST,   30.000000,    5.000000,$
CONTACT,    0.000000,TOL,    0.100000,$
USER_START,TYPE,,GOAL,,INFO,,PARAM,,END_PARAM,$
SPROG,,VAR_IND,,VAR_VAL,,USER_END
$$ Other parameters :     1.000000,    0.000000,    0.000000
GOTO  /  635.21944,  -75.13133,   19.00000, 0.000000, 0.000000, 1.000000
PROBE/OFF
```

```G code
CYCLE978(0,1,,1,19,100,100,3,2,1,"",,0,1.01,-1.01,,0.34,1,0,,1,0)
```
