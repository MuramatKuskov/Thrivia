# Thrivia

## Table of contests | Зміст
- [English](#en)
	- [Abstract](#abstract)
	- [Overview](#overwiev)
	- [User Guide](#user-guide)
		- [Parameters](#parameters)
		- [Conventional symbols](#conventional-symbols)
		- [Inspector](#inspector)
- [Українська](#ua)
	- [Анотація](#анотація)
	- [Огляд](#огляд)
	- [Посібник користувача](#посібник-користувача)
		- [Параметри](#параметри)
		- [Conventional symbols](#умовні-позначки)
		- [Інспектор](#інспектор)
- [TODO](#todo)
- [Credits](#credits)

## EN
### Abstract
This project aims to develop basic idea of evolutionary algrithm proposed by [foo52ru ТехноШаман (YouTube)](https://www.youtube.com/c/foo52ru) and graphically represent simulated world allowing user to inspect or even interact with it and it's population via user interface.

The main goal of current project is to implement biodiversity by genotype in addition to phenotype mechanic from original project. 
The secondary goal is to diversify bot's behaviour by adding more mechanics.

### Overwiev
The simulation represent a virtual world populated by creatures that can interact with each other and the environment.  
Bot's behaviour doesn't scripted. Instead, it's conditioned by genome of certain creature. Genome is a sequence of numbers,
each number points to specific instruction (move/eat/mutate/etc). This sequence is generated randomly for the first generation
and becomes subject to evolution during the simulation: children inherits their genome (sequence) from parents and mutate (by changing numbers at random positions).  
[Go to simulation](https://muramatkuskov.github.io/Thrivia/)


### User Guide
#### Parameters
- Geometry
	- **Closed**: crossing the edge of the screen being appears on the opposite side
	- **Confined**: borders of screen is walls
- Paint schemes
	- **Default**: All beings are initially green and their color shifts to red when they eat other creatures (the shift is less if being ate remains of other creature). Childrens are inheriting their color from parents.
	- **Energy**: Color of each creature represents it's energy state: from white (low energy) to bright-red (high energy). At the time there is also individuals with negative enery — they're painted in dark burgundy.
- Target selection strategies
	- **Cautious**: prefer non-relative beings when execute methods involving interactions
	- **Reactive**: prefer beings that are in range of sight
	- **Persistent**: prefer targets that are most consisted for current action (e.g. non-rels for hunt, relatives for altruistic behaviour)
- Genome size  
	Doesn't applies to previously generated world (after input press Stop button to generate new world)
- Continuous movement  
	When enabled, movement instruction changes pointer to next instruction with low probability,
	effectively allowing to continue move forward once started,
	untill something comes into field of view

#### Conventional symbols
Yellow circle — organic (food)  
Orange circle — remains (food)

#### Inspector
Shows actual information about selected target.  
Currently accessible via DevTools console.

## UA
### Анотація
Даний проєкт націлений на розвиток ідеї еволюційного алгоритму, запропонованого автором YouTube каналу [foo52ru ТехноШаман (YouTube)](https://www.youtube.com/c/foo52ru) та графічного відображення симуляції, з можливістю оглядати або навіть взаємодіяти з віртуальним світом та його населенням за допомогою інтерфейсу користувача.

Головною метою проєкту є реалізація біорізноманіття за генотипом у якості доповнення до механіки різноманіття за фенотипом з оригінального проєкту.
Другорядною метою є урізноманітнення видів поведінки істот шляхом розробки нових механік.

### Огляд
Симуляція представляє світ, населений створіннями, які можуть взаємодіяти одне з одним та з елементами оточення.  
Поведінка створінь не підчиняється певному сценарію. Замість цього, вона залежить від геному певної особи. Геном — це
послідовність чисел, кожне вказує на конкретну інструкцію (переміститись/їсти/мутувати/тощо). Ця послідовність генерується випадковим чином
для першого покоління створінь, після чого стає суб'єктом еволюційного процесу: за певних умов в геномі може відбутися мутація (заміна чисел на випадкових позиціях),
а наступні покоління істот наслідують геном від батьків.  
[Перейти до симуляції](https://muramatkuskov.github.io/Thrivia/)

### Посібник користувача
#### Параметри
- Геометрія
	- **Closed**: при перетині межі вікна, істота з'являється с протилежного боку
	- **Confined**: межі вікна = стіни
	- Кольорові схеми
	- **Default**: Усі створіння спочатку мають зелений колір, який поступово змінюється на червоний при поїданні інших істот (ефект менший при поїданні останків). Потомки наслідують колір батьків.
	- **Energy**: Колір істот відображає їх енергетичний стан: від білого (мало енергії) до світло-червоного (багато енергії). Трапляються індивіди з від'ємною енергією — вони пофарбовані у темно-бордовий колір.
- Стратегії вибору цілі
	- **Cautious**: при виконанні інструкцій що передбачають взаємодію з іншими істотами звертати більше уваги на наявність чужаків
	- **Reactive**: надавати перевагу особам, які знаходяться в межах дальності взаємодії
	- **Persistent**: звертати увагу на осіб, які найбільше підходять для поточної дії (чужаки для полювання, родичі для альтруїстичної поведінки)
	- Genome size  
	Зміни параметра не зачіпають раніше створений світ (після вводу нового значення необхіжно натиснути кнопку Stop для генерації нового світу)
- Безперервний рух  
	Коли увімкнено, інструкція переміщення змінює вказівник на наступну інструкцію
	з меншою вірогідністю, дозволяючи продовжувати прямолінійний рух після його початку,
	поки щось не попаде в поле зору.

#### Умовні позначки
Жовтий круг — органіка (їжа)  
Помаранчевий круг — останки (їжа)

#### Інспектор
Показує актуальну інформацію про вибрану ціль.  
Наразі інформація доступна у консолі вікна інструментів розробника.

## TODO:
- UI options: **bot memory variants**
- handle window resize & device orientation
- continuously stream state into observer window
- genes of altruism (allow bots to share energy)
- genes of genotype warfare 



## Credits
###### Inspired by [foo52ru ТехноШаман (YouTube)](https://www.youtube.com/c/foo52ru)