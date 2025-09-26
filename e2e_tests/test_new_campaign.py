from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

driver = webdriver.Chrome()
wait = WebDriverWait(driver, 10)

try:
    # Paso 1: Abrir la app
    driver.get("http://localhost:3000")
    print("1. Página principal cargada.")

    # Paso 2: Clic en "Add New Campaign" (home)
    home_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[text()='Add New Campaign']"))
    )
    home_btn.click()
    print("2. Clic en 'Add New Campaign' en la home.")

    # Paso 3: Clic en "+ Add Campaign" (vista de campañas)
    add_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[text()='+ Add Campaign']"))
    )
    add_btn.click()
    print("3. Clic en '+ Add Campaign'.")

    # Paso 4: Esperar a que el modal/formulario esté visible (por el título)
    wait.until(
        EC.text_to_be_present_in_element((By.TAG_NAME, "body"), "Add New Campaign")
    )
    print("4. Formulario de creación abierto.")

    # Paso 5: Rellenar campos usando placeholder
    test_value = "Prueba automatizada"

    driver.find_element(By.XPATH, "//input[@placeholder='Name']").send_keys(test_value)
    driver.find_element(By.XPATH, "//textarea[@placeholder='Description']").send_keys(test_value)
    driver.find_element(By.XPATH, "//input[@placeholder='Author']").send_keys(test_value)
    driver.find_element(By.XPATH, "//input[@placeholder='Game']").send_keys(test_value)
    driver.find_element(By.XPATH, "//textarea[@placeholder='Participants']").send_keys(test_value)
    driver.find_element(By.XPATH, "//textarea[@placeholder='Notes']").send_keys(test_value)
    print("5. Formulario rellenado.")

    # Paso 6: Clic en "Save"
    save_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[text()='Save']"))
    )
    save_btn.click()
    print("6. Clic en 'Save'.")

    # Paso 7: Verificar que la campaña aparece en la lista
    wait.until(
        EC.text_to_be_present_in_element((By.TAG_NAME, "body"), test_value)
    )
    print("7. Campaña visible en la lista.")

    print("✅ Prueba pasada: Campaña creada correctamente.")

except TimeoutException:
    print("❌ Prueba fallida: Tiempo de espera agotado.")
except Exception as e:
    print(f"❌ Prueba fallida: {str(e)}")
finally:
    driver.quit()