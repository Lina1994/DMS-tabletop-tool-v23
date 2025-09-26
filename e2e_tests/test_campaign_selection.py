from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

driver = webdriver.Chrome()

try:
    driver.get("http://localhost:3000")
    
    wait = WebDriverWait(driver, 10)
    
    # Esperar a que un elemento contenga el texto esperado
    wait.until(EC.text_to_be_present_in_element((By.TAG_NAME, "body"), "Select a Campaign or Add a New One"))

    print("Prueba pasada: Se encontró el mensaje de selección de campaña.")

except TimeoutException:
    print("Prueba fallida: No se encontró el mensaje esperado en la página.")

finally:
    driver.quit()