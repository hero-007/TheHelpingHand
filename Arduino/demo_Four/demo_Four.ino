
#include <EEPROM.h>
#include <SPI.h>
#include <boards.h>
#include <RBL_nRF8001.h>

int sensePin1 = 0;
int sensePin2 = 1;
int sensePin3 = 2;
int sensePin4 = 3;
int pass[4];


void setup()
{
  ble_set_name("helper");
  ble_begin();
  Serial.begin(9600);
  
}

char convertChar(int a){
  if(a==1)
    return '1';
  else
    return '0';
}
void loop()
{
  int pin1 = analogRead(sensePin1);
  int pin2 = analogRead(sensePin2);
  int pin3 = analogRead(sensePin3);
  int pin4 = analogRead(sensePin4);
  
  // convert analog value at pin1 to binary
  if(pin1<150){
    pin1 = 1;
  }else{
    pin1 = 0;
  }
  
  // convert analog value at pin2 to binary
  if(pin2<90){
    pin2 = 1;
  }else{
    pin2 = 0;
  }
  
  // convert analog value at pin3 to binary
  if(pin3<400){
    pin3 = 1;
  }else{
    pin3 = 0; 
  }
    
 // convert analog value at pinn4 to binary
 if(pin4 < 400){
   pin4 = 1;
 }else{
   pin4 = 0;
 }
 
 pass[0] = pin1;
 pass[1] = pin2;
 pass[2] = pin3;
 pass[3] = pin4;
 
 Serial.print(pass[0]);
 Serial.print(pass[1]);
 Serial.print(pass[2]);
 Serial.print(pass[3]);
 Serial.println();
 delay(600);
 
 
  if(ble_connected()){
   ble_write(convertChar(pass[0]));
   ble_write(convertChar(pass[1]));
   ble_write(convertChar(pass[2]));
   ble_write(convertChar(pass[3]));
   
 }
 
 ble_do_events();
 
  if ( ble_available() )
  {
    while ( ble_available() )
    {
      Serial.write(ble_read());
    }
    
    Serial.println();
  }
 
}
