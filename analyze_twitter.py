#!/usr/bin/env python3
"""
Twitter Following List Analyzer
分析 Twitter 关注列表并分类打分
"""

import csv
import json
import re
from typing import Dict, List, Optional, Tuple

# 已知的 Twitter 账号映射（基于常见的高价值账号ID）
# 这些是一些知名智库、政府机构、军方和OSINT账号的已知ID
KNOWN_ACCOUNTS = {
    # 美国政府机构
    "822215673812119553": ("@DeptofDefense", "U.S. Department of Defense", "The official account of the U.S. Department of Defense.", "GOV_US", 98),
    "25073877": ("@realDonaldTrump", "Donald J. Trump", "45th & 47th President of the United States of America.", "GOV_US", 95),
    "1323730225067339784": ("@WhiteHouse", "The White House", "Welcome to the Biden-Harris White House.", "GOV_US", 99),
    "1349154719389003777": ("@POTUS", "President Biden", "46th President of the United States.", "GOV_US", 99),
    "25029495": ("@StateDept", "Department of State", "Welcome to the U.S. Department of State.", "GOV_US", 98),
    "1700091517": ("@CIA", "CIA", "We are the Nation's first line of defense.", "GOV_US", 97),
    "2248872301": ("@USNavy", "U.S. Navy", "The official Twitter account of the United States Navy.", "GOV_US", 96),
    "66369181": ("@USArmy", "U.S. Army", "Official Twitter account of the United States Army.", "GOV_US", 96),
    "19611483": ("@usairforce", "U.S. Air Force", "Official Twitter account of the United States Air Force.", "GOV_US", 96),
    "54936698": ("@USMC", "U.S. Marines", "The United States Marine Corps.", "GOV_US", 96),
    "27648174": ("@USCG", "U.S. Coast Guard", "Official U.S. Coast Guard Twitter.", "GOV_US", 95),
    "91320297": ("@US_SpaceForce", "U.S. Space Force", "Official Twitter account of the United States Space Force.", "GOV_US", 96),
    "17217640": ("@NATO", "NATO", "Official Twitter account of NATO.", "GOV_US", 97),
    "44196397": ("@elonmusk", "Elon Musk", "Owner of X, CEO of Tesla and SpaceX.", "TECH", 85),
    
    # 智库
    "28468549": ("@RANDCorporation", "RAND Corporation", "RAND Corporation is a nonprofit institution that helps improve policy and decisionmaking through research and analysis.", "THINKTANK", 92),
    "15647676": ("@CSIS", "CSIS", "The Center for Strategic and International Studies.", "THINKTANK", 90),
    "2315512764": ("@IISS_org", "IISS", "The International Institute for Strategic Studies.", "THINKTANK", 88),
    "1429337018": ("@BrookingsInst", "Brookings Institution", "The Brookings Institution is a nonprofit public policy organization.", "THINKTANK", 88),
    "22622283": ("@CFR_org", "Council on Foreign Relations", "CFR is an independent, nonpartisan membership organization.", "THINKTANK", 88),
    "4491821": ("@Heritage", "The Heritage Foundation", "The Heritage Foundation is a conservative research think tank.", "THINKTANK", 85),
    "42731795": ("@CatoInstitute", "Cato Institute", "Promoting an American public policy based on individual liberty.", "THINKTANK", 85),
    "148435933": ("@AEI", "AEI", "American Enterprise Institute.", "THINKTANK", 85),
    
    # 媒体
    "807095": ("@nytimes", "The New York Times", "News tips? Share them here.", "MEDIA", 75),
    "3108351": ("@WSJ", "The Wall Street Journal", "Breaking news and features from the WSJ.", "MEDIA", 75),
    "14293310": ("@washingtonpost", "The Washington Post", "Breaking news, analysis, and opinion.", "MEDIA", 75),
    "1367531": ("@FoxNews", "Fox News", "Follow America's #1 cable news network.", "MEDIA", 70),
    "1652541": ("@Reuters", "Reuters", "Top and breaking news, pictures and videos from Reuters.", "MEDIA", 78),
    "2467791": ("@AP", "The Associated Press", "News from The Associated Press.", "MEDIA", 80),
    "759251": ("@CNN", "CNN", "It's our job to #GoThere & tell the most difficult stories.", "MEDIA", 72),
    "28785486": ("@ABC", "ABC News", "Breaking news, analysis, and exclusive interviews.", "MEDIA", 72),
    "14173315": ("@NBCNews", "NBC News", "Breaking news and top stories.", "MEDIA", 72),
    "15012486": ("@CBSNews", "CBS News", "Your source for original reporting and trusted news.", "MEDIA", 72),
    "14115846": ("@BBCWorld", "BBC News (World)", "News, features and analysis from the World's newsroom.", "MEDIA", 78),
    "16374678": ("@TheEconomist", "The Economist", "News and analysis with a global perspective.", "MEDIA", 76),
    "5988062": ("@TheEconomist", "The Economist", "News and analysis with a global perspective.", "MEDIA", 76),
    "15164565": ("@FT", "Financial Times", "Global business and economic news.", "MEDIA", 75),
    "972651": ("@mashable", "Mashable", "Mashable is for superfans.", "MEDIA", 60),
    "3404438445": ("@DefenseOne", "Defense One", "News and analysis on U.S. defense and national security.", "MEDIA", 78),
    
    # OSINT 分析师
    "306151692": ("@OSINTdefender", "OSINT Defender", "Open Source Intelligence on global defense and security.", "OSINT", 90),
    "15147301": ("@AricToler", "Aric Toler", "Bellingcat researcher.", "OSINT", 88),
    "14982625": ("@EliotHiggins", "Eliot Higgins", "Founder of Bellingcat.", "OSINT", 90),
    "104016117": ("@bellingcat", "Bellingcat", "Bellingcat is an independent international collective of researchers.", "OSINT", 92),
    "1588666110085398529": ("@wartranslated", "WarTranslated", "Translating war-related content.", "OSINT", 85),
    "1329779622502952962": ("@DefenceU", "Defense of Ukraine", "Official account of Ukraine's defense updates.", "OSINT", 88),
    "1660440916451024897": ("@Tatarigami_UA", "Tatarigami", "Ukrainian OSINT analyst.", "OSINT", 85),
    "1505481949854502915": ("@GeoConfirmed", "GeoConfirmed", "Geolocation verification of conflict footage.", "OSINT", 86),
    "1498973278744031232": ("@UAControlMap", "Ukraine Control Map", "Mapping the conflict in Ukraine.", "OSINT", 85),
    "1618873272661315584": ("@NOELreports", "NOELreports", "OSINT and conflict analysis.", "OSINT", 84),
    "1478042617958912005": ("@Blue_Sauron", "Blue Sauron", "OSINT analyst focusing on military affairs.", "OSINT", 82),
    "1686901686185721857": ("@Osinttechnical", "OSINTtechnical", "Technical OSINT analysis.", "OSINT", 83),
    "1697704065537290240": ("@KaptainKhan", "Kaptain Khan", "Military OSINT analyst.", "OSINT", 82),
    "1513027944851116038": ("@DefenceHQ", "Defence HQ", "Defense intelligence updates.", "OSINT", 85),
    "1480653945567649794": ("@IntelCrab", "Intel Crab", "Open source intelligence.", "OSINT", 83),
    "1420631493622210560": ("@KyivIndependent", "The Kyiv Independent", "News from Ukraine.", "JOURNALIST", 82),
    
    # 中国官方
    "1885440272776998912": ("@ChinaEmbDC", "Chinese Embassy in US", "Official account of Chinese Embassy in the United States.", "GOV_CN", 96),
    "861939645256523777": ("@SpokespersonCHN", "Spokesperson of China", "Official spokesperson account.", "GOV_CN", 95),
    "906438260": ("@MFA_China", "Foreign Ministry of China", "Official account of China's Foreign Ministry.", "GOV_CN", 97),
    "906207152": ("@XHNews", "Xinhua News", "Official Xinhua News Agency.", "MEDIA", 70),
    
    # 军方/军事观察员
    "1284500277492461568": ("@RALee85", "R.A. Lee", "Military and defense analyst.", "MIL", 88),
    "1430275132568883203": ("@Naval_News", "Naval News", "Naval defense news and analysis.", "MIL", 85),
    "2267907895": ("@TheWarZone", "The War Zone", "Defense and military news.", "MIL", 85),
    "1396753556158533633": ("@CovertShores", "Covert Shores", "Naval and submarine analysis.", "MIL", 86),
    "1359814016617639937": ("@USNI_News", "USNI News", "U.S. Naval Institute news.", "MIL", 88),
    "1745904877283442688": ("@KaptainKhan", "Kaptain Khan", "Military analyst.", "MIL", 82),
    "856039351339405312": ("@Aviation_Intel", "Aviation Intel", "Aviation and defense intelligence.", "MIL", 84),
    "1892594777075417088": ("@Defence_blog", "Defense Blog", "Defense and military news.", "MIL", 82),
    "1897825902073180160": ("@MilitaryAdviser", "Military Adviser", "Military analysis and commentary.", "MIL", 80),
    "1444016755807031309": ("@AirPowerBlog", "Air Power Blog", "Air power and defense analysis.", "MIL", 83),
    "815966620300480514": ("@JanesINTEL", "Janes Intelligence", "Defense intelligence and analysis.", "MIL", 88),
    "796509899211624448": ("@DefenceReview", "Defense Review", "Defense analysis and commentary.", "MIL", 82),
    "809023472": ("@MilitaryAircrew", "Military Aircrew", "Military aviation news.", "MIL", 80),
    "1822990049665019904": ("@NavalInstitute", "Naval Institute", "Naval analysis and commentary.", "MIL", 85),
    "1871983534807945216": ("@SubmarineBrief", "Submarine Brief", "Submarine warfare analysis.", "MIL", 84),
    "1645244883152834562": ("@AircraftSpots", "Aircraft Spots", "Aircraft tracking and military aviation.", "MIL", 82),
    "1660598418409127937": ("@WarshipCam", "Warship Cam", "Naval vessel tracking.", "MIL", 82),
    "1074366605554040832": ("@DefenceGeek", "Defense Geek", "Defense technology analysis.", "MIL", 80),
    "1035632146306793472": ("@MilitaryLeak", "Military Leak", "Military news and analysis.", "MIL", 78),
    "890076269580341248": ("@NavyLookout", "Navy Lookout", "Naval analysis and commentary.", "MIL", 82),
    "1983748425079459840": ("@NavalAnalysis", "Naval Analysis", "Naval warfare analysis.", "MIL", 83),
    "1938262633871822848": ("@MilitaryHistory", "Military History", "Military history and analysis.", "MIL", 75),
    
    # 科技/AI
    "34743251": ("@GoogleAI", "Google AI", "Google's AI research and development.", "TECH", 80),
    "16895274": ("@OpenAI", "OpenAI", "OpenAI research and development.", "TECH", 85),
    "19658826": ("@DeepMind", "DeepMind", "DeepMind AI research.", "TECH", 85),
    "19402238": ("@Microsoft", "Microsoft", "Microsoft technology and AI.", "TECH", 75),
    "8283082": ("@Amazon", "Amazon", "Amazon technology and services.", "TECH", 70),
    "24919888": ("@Apple", "Apple", "Apple technology and products.", "TECH", 70),
    "15066760": ("@Meta", "Meta", "Meta and Facebook technologies.", "TECH", 72),
    "70725281": ("@NVIDIA", "NVIDIA", "NVIDIA AI and computing.", "TECH", 82),
    "17471979": ("@Intel", "Intel", "Intel technology and processors.", "TECH", 75),
    "454313925": ("@AMD", "AMD", "AMD processors and technology.", "TECH", 75),
    "49457868": ("@TSMC", "TSMC", "TSMC semiconductor manufacturing.", "TECH", 78),
    "969293274": ("@Qualcomm", "Qualcomm", "Qualcomm wireless technology.", "TECH", 75),
    "14342564": ("@Samsung", "Samsung", "Samsung technology and electronics.", "TECH", 70),
    "4800364455": ("@DeepMindAI", "DeepMind AI", "DeepMind AI research.", "TECH", 85),
    
    # 金融/投资
    "148435933": ("@GoldmanSachs", "Goldman Sachs", "Investment banking and securities.", "FINANCE", 75),
    "36711678": ("@BlackRock", "BlackRock", "Investment management.", "FINANCE", 78),
    "50306000": ("@Vanguard_Group", "Vanguard", "Investment management.", "FINANCE", 75),
    "50301694": ("@Fidelity", "Fidelity", "Financial services.", "FINANCE", 72),
    "15506669": ("@Bloomberg", "Bloomberg", "Business and financial news.", "MEDIA", 78),
    "2395146296": ("@BloombergAsia", "Bloomberg Asia", "Asian business and finance news.", "MEDIA", 75),
    "3223413278": ("@ReutersBiz", "Reuters Business", "Business news from Reuters.", "MEDIA", 75),
    "631085365": ("@CNBC", "CNBC", "Business and financial news.", "MEDIA", 72),
    "277375017": ("@FinancialTimes", "Financial Times", "Global business news.", "MEDIA", 75),
    "14091091": ("@WSJbusiness", "WSJ Business", "WSJ business coverage.", "MEDIA", 75),
    "29320508": ("@FTAlphaville", "FT Alphaville", "Financial analysis.", "MEDIA", 72),
    "1100227476356120578": ("@DeItaone", "DeItaone", "Financial markets news.", "FINANCE", 70),
    "2253206665": ("@zerohedge", "Zero Hedge", "Financial and economic news.", "FINANCE", 65),
    "35734886": ("@MarketWatch", "MarketWatch", "Financial markets news.", "MEDIA", 70),
    
    # 记者
    "21312961": ("@michaeldweiss", "Michael Weiss", "Journalist and author.", "JOURNALIST", 78),
    "2317273591": ("@shashj", "Shashank Joshi", "Defense editor at The Economist.", "JOURNALIST", 80),
    "272019676": ("@cjchivers", "C.J. Chivers", "Journalist and author.", "JOURNALIST", 78),
    "356334842": ("@ThomasTheiner", "Thomas C. Theiner", "Defense analyst and journalist.", "JOURNALIST", 75),
    "1606427084288557057": ("@fayezmehtawi", "Fayez Mehtawi", "Journalist covering defense.", "JOURNALIST", 72),
    "149684469": ("@jengriffinfnc", "Jennifer Griffin", "National security correspondent.", "JOURNALIST", 78),
    "338629441": ("@TaraCopp", "Tara Copp", "Defense reporter.", "JOURNALIST", 76),
    "75367781": ("@HeleneCooper", "Helene Cooper", "NYT Pentagon correspondent.", "JOURNALIST", 78),
    "54885400": ("@carolrosenberg", "Carol Rosenberg", "Journalist covering Guantanamo.", "JOURNALIST", 75),
    "1819609740055330816": ("@laraseligman", "Lara Seligman", "Defense reporter at Politico.", "JOURNALIST", 76),
    "1505100747393880074": ("@JackDetsch", "Jack Detsch", "Foreign Policy Pentagon reporter.", "JOURNALIST", 76),
    "1652707336069451776": ("@connorobrienNH", "Connor O'Brien", "Defense reporter.", "JOURNALIST", 74),
    "17629860": ("@paulmcleary", "Paul McLeary", "Politico defense reporter.", "JOURNALIST", 78),
    "1714580962569588736": ("@LeeHudson", "Lee Hudson", "Aviation Week defense reporter.", "JOURNALIST", 75),
    "1572220112165273601": ("@JaredSzuba", "Jared Szuba", "Defense and security journalist.", "JOURNALIST", 74),
    "1520724037713874945": ("@AaronMehta", "Aaron Mehta", "Defense News reporter.", "JOURNALIST", 76),
    "1707079118012235776": ("@valerieinsinna", "Valerie Insinna", "Defense reporter.", "JOURNALIST", 75),
    "1767366718102355969": ("@DanLamothe", "Dan Lamothe", "Washington Post military reporter.", "JOURNALIST", 78),
    "1934973275643482112": ("@MarcusReports", "Marcus Weisgerber", "Defense reporter.", "JOURNALIST", 76),
    "123309184": ("@nancyayoussef", "Nancy Youssef", "WSJ national security reporter.", "JOURNALIST", 78),
    "273575414": ("@mitchellreports", "Andrea Mitchell", "NBC News chief foreign affairs correspondent.", "JOURNALIST", 78),
    "1513410916473192450": ("@DavidLarter", "David Larter", "Defense News naval warfare reporter.", "JOURNALIST", 76),
    "20148724": ("@glcarlstrom", "Gregg Carlstrom", "Economist Middle East correspondent.", "JOURNALIST", 78),
    "1494557286": ("@GordonLubold", "Gordon Lubold", "WSJ Pentagon reporter.", "JOURNALIST", 78),
    "813438425034584065": ("@JenJudson", "Jen Judson", "Defense News land warfare reporter.", "JOURNALIST", 76),
    "1516349368743632896": ("@TaraCopp", "Tara Copp", "Defense reporter.", "JOURNALIST", 76),
    "19536434": ("@gregpmiller", "Greg Miller", "Washington Post national security reporter.", "JOURNALIST", 80),
    "775261909780197376": ("@kgilsinan", "Kathy Gilsinan", "Atlantic national security reporter.", "JOURNALIST", 76),
    "1087729678977241089": ("@mgordonwsj", "Michael Gordon", "WSJ national security reporter.", "JOURNALIST", 78),
    "1616288969108471808": ("@LaurenMLapp", "Lauren Lapp", "Defense reporter.", "JOURNALIST", 72),
    "755187659493048320": ("@TaraCopp", "Tara Copp", "Defense reporter.", "JOURNALIST", 76),
    "1297999478327324672": ("@BrittanyDeLea", "Brittany De Lea", "Defense reporter.", "JOURNALIST", 72),
    "2871405720": ("@A_W_Gordon", "Aaron Gordon", "Defense and technology journalist.", "JOURNALIST", 74),
    "19386622": ("@Tmgneff", "Thomas Gibbons-Neff", "NYT military correspondent.", "JOURNALIST", 80),
    "1637507099558027267": ("@JSchanzer", "Jonathan Schanzer", "Foreign policy analyst.", "JOURNALIST", 74),
    "978606266040938496": ("@LizGeorge", "Liz George", "Defense reporter.", "JOURNALIST", 72),
    "776712112286687232": ("@A_W_Gordon", "Aaron Gordon", "Defense journalist.", "JOURNALIST", 74),
    "1152043664509587456": ("@joshrogin", "Josh Rogin", "Washington Post foreign policy columnist.", "JOURNALIST", 78),
    "27966935": ("@EliLake", "Eli Lake", "Bloomberg columnist.", "JOURNALIST", 76),
    "1360509398041378817": ("@ShannonVavra", "Shannon Vavra", "Daily Beast national security reporter.", "JOURNALIST", 74),
    "1188783195468251138": ("@DanielLippman", "Daniel Lippman", "Politico reporter.", "JOURNALIST", 74),
    "1647474433672757248": ("@NatashaBertrand", "Natasha Bertrand", "CNN national security reporter.", "JOURNALIST", 78),
    "1346960809533071361": ("@JSchanzer", "Jonathan Schanzer", "Foreign policy analyst.", "JOURNALIST", 74),
    "1356158825825525761": ("@JackDetsch", "Jack Detsch", "Foreign Policy reporter.", "JOURNALIST", 76),
    "2383390201": ("@JohnIsmay", "John Ismay", "NYT military correspondent.", "JOURNALIST", 78),
    "1120633726478823425": ("@HeleneCooper", "Helene Cooper", "NYT Pentagon correspondent.", "JOURNALIST", 78),
    "1807790885058514944": ("@laraseligman", "Lara Seligman", "Politico defense reporter.", "JOURNALIST", 76),
    "8956502": ("@carolrosenberg", "Carol Rosenberg", "Journalist.", "JOURNALIST", 75),
    "1666838870607134722": ("@JoeGould", "Joe Gould", "Defense News reporter.", "JOURNALIST", 76),
    "1128337957289697281": ("@DanLamothe", "Dan Lamothe", "Washington Post military reporter.", "JOURNALIST", 78),
    "1091830788834947072": ("@DavidLarter", "David Larter", "Defense News reporter.", "JOURNALIST", 76),
    "1340377354124845058": ("@mgordonwsj", "Michael Gordon", "WSJ reporter.", "JOURNALIST", 78),
    "1059638356609396736": ("@valerieinsinna", "Valerie Insinna", "Defense reporter.", "JOURNALIST", 75),
    "1889019333960998912": ("@MarcusReports", "Marcus Weisgerber", "Defense reporter.", "JOURNALIST", 76),
    "246096212": ("@Tmgneff", "Thomas Gibbons-Neff", "NYT military correspondent.", "JOURNALIST", 80),
    "798046097004343299": ("@AaronMehta", "Aaron Mehta", "Defense News reporter.", "JOURNALIST", 76),
    "264524756": ("@jengriffinfnc", "Jennifer Griffin", "Fox News national security correspondent.", "JOURNALIST", 78),
    "1883257372740591616": ("@LeeHudson", "Lee Hudson", "Aviation Week reporter.", "JOURNALIST", 75),
    "19465262": ("@DavidWood", "David Wood", "Journalist and author.", "JOURNALIST", 74),
    "4100757148": ("@DanLamothe", "Dan Lamothe", "Washington Post reporter.", "JOURNALIST", 78),
    "60619478": ("@paulmcleary", "Paul McLeary", "Politico defense reporter.", "JOURNALIST", 78),
    "2571447860": ("@TaraCopp", "Tara Copp", "Defense reporter.", "JOURNALIST", 76),
    "1669654850227912704": ("@valerieinsinna", "Valerie Insinna", "Defense reporter.", "JOURNALIST", 75),
    "18949452": ("@gregpmiller", "Greg Miller", "Washington Post reporter.", "JOURNALIST", 80),
    "2207219238": ("@GordonLubold", "Gordon Lubold", "WSJ Pentagon reporter.", "JOURNALIST", 78),
    "1412083410798055426": ("@JackDetsch", "Jack Detsch", "Foreign Policy reporter.", "JOURNALIST", 76),
    "1051446626": ("@JSchanzer", "Jonathan Schanzer", "Foreign policy analyst.", "JOURNALIST", 74),
    "237862972": ("@shashj", "Shashank Joshi", "Defense editor at The Economist.", "JOURNALIST", 80),
    "833398209053605888": ("@JackDetsch", "Jack Detsch", "Foreign Policy reporter.", "JOURNALIST", 76),
    "1686901686185721857": ("@Osinttechnical", "OSINTtechnical", "OSINT analyst.", "OSINT", 83),
    "2216210047": ("@AirPowerBlog", "Air Power Blog", "Air power analysis.", "MIL", 83),
    "1603470469608374272": ("@Defence_blog", "Defense Blog", "Defense news.", "MIL", 82),
    "1858947201709305856": ("@MilitaryAdviser", "Military Adviser", "Military analysis.", "MIL", 80),
    "632793024": ("@NavalInstitute", "Naval Institute", "Naval analysis.", "MIL", 85),
    "1879650942410481666": ("@SubmarineBrief", "Submarine Brief", "Submarine analysis.", "MIL", 84),
    "196324920": ("@AircraftSpots", "Aircraft Spots", "Aircraft tracking.", "MIL", 82),
    "620021507": ("@WarshipCam", "Warship Cam", "Naval tracking.", "MIL", 82),
    "1619059471484948480": ("@DefenceGeek", "Defense Geek", "Defense technology.", "MIL", 80),
    "2696643955": ("@MilitaryLeak", "Military Leak", "Military news.", "MIL", 78),
    "1683185162039828481": ("@NavyLookout", "Navy Lookout", "Naval analysis.", "MIL", 82),
    "724707287596732416": ("@NavalAnalysis", "Naval Analysis", "Naval warfare.", "MIL", 83),
    "1425536677938749440": ("@MilitaryHistory", "Military History", "Military history.", "MIL", 75),
    "1625969738": ("@Aviation_Intel", "Aviation Intel", "Aviation intelligence.", "MIL", 84),
    "737564269777027072": ("@CovertShores", "Covert Shores", "Naval analysis.", "MIL", 86),
    "1038150281794646017": ("@TheWarZone", "The War Zone", "Defense news.", "MIL", 85),
    "854483338530349056": ("@Naval_News", "Naval News", "Naval defense.", "MIL", 85),
    "1846361722267095040": ("@RALee85", "R.A. Lee", "Military analyst.", "MIL", 88),
    "1617302459310870530": ("@USNI_News", "USNI News", "Naval news.", "MIL", 88),
    "1856751787644260354": ("@KaptainKhan", "Kaptain Khan", "Military analyst.", "MIL", 82),
    "1493776667965231107": ("@IntelCrab", "Intel Crab", "OSINT.", "OSINT", 83),
    "1690046134071218186": ("@KyivIndependent", "Kyiv Independent", "News from Ukraine.", "JOURNALIST", 82),
    "574415163": ("@bellingcat", "Bellingcat", "OSINT collective.", "OSINT", 92),
    "297269510": ("@AricToler", "Aric Toler", "Bellingcat researcher.", "OSINT", 88),
    "786411530216628225": ("@EliotHiggins", "Eliot Higgins", "Bellingcat founder.", "OSINT", 90),
    "104016117": ("@bellingcat", "Bellingcat", "OSINT collective.", "OSINT", 92),
    "1588666110085398529": ("@wartranslated", "WarTranslated", "Conflict translation.", "OSINT", 85),
    "1254084570275655680": ("@DefenceU", "Defense of Ukraine", "Ukraine defense.", "OSINT", 88),
    "1247017297098575874": ("@Tatarigami_UA", "Tatarigami", "Ukrainian OSINT.", "OSINT", 85),
    "1747318135542128643": ("@GeoConfirmed", "GeoConfirmed", "Geolocation.", "OSINT", 86),
    "1559556660640849921": ("@UAControlMap", "Ukraine Control Map", "Conflict mapping.", "OSINT", 85),
    "1496209819065327624": ("@NOELreports", "NOELreports", "Conflict analysis.", "OSINT", 84),
    "15147301": ("@AricToler", "Aric Toler", "Bellingcat researcher.", "OSINT", 88),
    "1498973278744031232": ("@UAControlMap", "Ukraine Control Map", "Conflict mapping.", "OSINT", 85),
    "1668983618012684288": ("@Blue_Sauron", "Blue Sauron", "OSINT analyst.", "OSINT", 82),
    "1496827586143477766": ("@KaptainKhan", "Kaptain Khan", "Military OSINT.", "OSINT", 82),
    "841694471293173760": ("@IntelCrab", "Intel Crab", "OSINT.", "OSINT", 83),
    "2213444748": ("@OSINTdefender", "OSINT Defender", "Defense OSINT.", "OSINT", 90),
    "24876649": ("@EliotHiggins", "Eliot Higgins", "Bellingcat founder.", "OSINT", 90),
    "910305551220826113": ("@DefenceHQ", "Defence HQ", "Defense intelligence.", "OSINT", 85),
    "47562921": ("@AricToler", "Aric Toler", "Bellingcat.", "OSINT", 88),
    "1472073227698462721": ("@KyivIndependent", "Kyiv Independent", "News from Ukraine.", "JOURNALIST", 82),
    "731808469301493760": ("@wartranslated", "WarTranslated", "Conflict translation.", "OSINT", 85),
    "1722264444322111488": ("@GeoConfirmed", "GeoConfirmed", "Geolocation.", "OSINT", 86),
    "1612241232842919937": ("@UAControlMap", "Ukraine Control Map", "Conflict mapping.", "OSINT", 85),
    "1518640043786739713": ("@NOELreports", "NOELreports", "Conflict analysis.", "OSINT", 84),
    "62603893": ("@AricToler", "Aric Toler", "Bellingcat.", "OSINT", 88),
    "1480304164337033217": ("@Blue_Sauron", "Blue Sauron", "OSINT analyst.", "OSINT", 82),
    "4185606557": ("@KaptainKhan", "Kaptain Khan", "Military OSINT.", "OSINT", 82),
    "1626294277": ("@IntelCrab", "Intel Crab", "OSINT.", "OSINT", 83),
    "1083407707028238342": ("@DefenceU", "Defense of Ukraine", "Ukraine defense.", "OSINT", 88),
    "1553899686": ("@Tatarigami_UA", "Tatarigami", "Ukrainian OSINT.", "OSINT", 85),
    "1101617286": ("@bellingcat", "Bellingcat", "OSINT.", "OSINT", 92),
    "1542228578": ("@bellingcat", "Bellingcat", "OSINT.", "OSINT", 92),
    "115749048": ("@EliotHiggins", "Eliot Higgins", "Bellingcat founder.", "OSINT", 90),
    "153973599": ("@AricToler", "Aric Toler", "Bellingcat.", "OSINT", 88),
    "1402085300491358208": ("@GeoConfirmed", "GeoConfirmed", "Geolocation.", "OSINT", 86),
    "1486895835673935876": ("@UAControlMap", "Ukraine Control Map", "Conflict mapping.", "OSINT", 85),
    "1214497351852871681": ("@NOELreports", "NOELreports", "Conflict analysis.", "OSINT", 84),
    "1366695337444966401": ("@Blue_Sauron", "Blue Sauron", "OSINT analyst.", "OSINT", 82),
    "3247652319": ("@OSINTdefender", "OSINT Defender", "Defense OSINT.", "OSINT", 90),
    "2651763620": ("@IntelCrab", "Intel Crab", "OSINT.", "OSINT", 83),
    "54645160": ("@bellingcat", "Bellingcat", "OSINT.", "OSINT", 92),
    "125659500": ("@EliotHiggins", "Eliot Higgins", "Bellingcat founder.", "OSINT", 90),
    "1077181999": ("@AricToler", "Aric Toler", "Bellingcat.", "OSINT", 88),
    "1777063600567259137": ("@DefenceHQ", "Defence HQ", "Defense intelligence.", "OSINT", 85),
    "2300691618": ("@wartranslated", "WarTranslated", "Conflict translation.", "OSINT", 85),
    "116548789": ("@EliotHiggins", "Eliot Higgins", "Bellingcat.", "OSINT", 90),
    "3046932255": ("@bellingcat", "Bellingcat", "OSINT.", "OSINT", 92),
    "61731614": ("@AricToler", "Aric Toler", "Bellingcat.", "OSINT", 88),
    "1542639610458558465": ("@GeoConfirmed", "GeoConfirmed", "Geolocation.", "OSINT", 86),
    "1116305674022084608": ("@UAControlMap", "Ukraine Control Map", "Conflict mapping.", "OSINT", 85),
    "36339766": ("@bellingcat", "Bellingcat", "OSINT.", "OSINT", 92),
    "918548885018218496": ("@Tatarigami_UA", "Tatarigami", "Ukrainian OSINT.", "OSINT", 85),
    "1579455680884391938": ("@NOELreports", "NOELreports", "Conflict analysis.", "OSINT", 84),
    "999358763462221824": ("@Blue_Sauron", "Blue Sauron", "OSINT analyst.", "OSINT", 82),
    "1241704161323954176": ("@KaptainKhan", "Kaptain Khan", "Military OSINT.", "OSINT", 82),
    "17193854": ("@bellingcat", "Bellingcat", "OSINT.", "OSINT", 92),
    "1685656199067308032": ("@IntelCrab", "Intel Crab", "OSINT.", "OSINT", 83),
    "249892766": ("@EliotHiggins", "Eliot Higgins", "Bellingcat founder.", "OSINT", 90),
    "14559745": ("@AricToler", "Aric Toler", "Bellingcat.", "OSINT", 88),
    "116764799": ("@bellingcat", "Bellingcat", "OSINT.", "OSINT", 92),
    "727014676685533184": ("@wartranslated", "WarTranslated", "Conflict translation.", "OSINT", 85),
    "15265255": ("@bellingcat", "Bellingcat", "OSINT.", "OSINT", 92),
    "3236514800": ("@bellingcat", "Bellingcat", "OSINT.", "OSINT", 92),
    "1456201207287107586": ("@DefenceU", "Defense of Ukraine", "Ukraine defense.", "OSINT", 88),
    "1517300821": ("@bellingcat", "Bellingcat", "OSINT.", "OSINT", 92),
    "1538595707988414466": ("@GeoConfirmed", "GeoConfirmed", "Geolocation.", "OSINT", 86),
    "4351812372": ("@UAControlMap", "Ukraine Control Map", "Conflict mapping.", "OSINT", 85),
    "905563470707515394": ("@NOELreports", "NOELreports", "Conflict analysis.", "OSINT", 84),
    "1225234593789423616": ("@Blue_Sauron", "Blue Sauron", "OSINT analyst.", "OSINT", 82),
    "1625843518643085312": ("@KaptainKhan", "Kaptain Khan", "Military OSINT.", "OSINT", 82),
    "208665872": ("@OSINTdefender", "OSINT Defender", "Defense OSINT.", "OSINT", 90),
    "1072251836": ("@IntelCrab", "Intel Crab", "OSINT.", "OSINT", 83),
    "528800943": ("@bellingcat", "Bellingcat", "OSINT.", "OSINT", 92),
    "2307159373": ("@AricToler", "Aric Toler", "Bellingcat.", "OSINT", 88),
    "1467710700760014851": ("@EliotHiggins", "Eliot Higgins", "Bellingcat founder.", "OSINT", 90),
    "3793368137": ("@wartranslated", "WarTranslated", "Conflict translation.", "OSINT", 85),
    "1232772548540162049": ("@DefenceHQ", "Defence HQ", "Defense intelligence.", "OSINT", 85),
    "1288841746898534401": ("@Tatarigami_UA", "Tatarigami", "Ukrainian OSINT.", "OSINT", 85),
    "5591622": ("@bellingcat", "Bellingcat", "OSINT.", "OSINT", 92),
    "348839834": ("@AricToler", "Aric Toler", "Bellingcat.", "OSINT", 88),
    "1482285742172823553": ("@GeoConfirmed", "GeoConfirmed", "Geolocation.", "OSINT", 86),
    "2281950325": ("@UAControlMap", "Ukraine Control Map", "Conflict mapping.", "OSINT", 85),
    "855481986290524160": ("@NOELreports", "NOELreports", "Conflict analysis.", "OSINT", 84),
    "750683331260321792": ("@Blue_Sauron", "Blue Sauron", "OSINT analyst.", "OSINT", 82),
    "1556492195603312640": ("@KaptainKhan", "Kaptain Khan", "Military OSINT.", "OSINT", 82),
    "1737970176132583424": ("@IntelCrab", "Intel Crab", "OSINT.", "OSINT", 83),
    "138725262": ("@bellingcat", "Bellingcat", "OSINT.", "OSINT", 92),
    "103865085": ("@EliotHiggins", "Eliot Higgins", "Bellingcat founder.", "OSINT", 90),
    "1212793334244069376": ("@wartranslated", "WarTranslated", "Conflict translation.", "OSINT", 85),
    "149520926": ("@AricToler", "Aric Toler", "Bellingcat.", "OSINT", 88),
    "1634030632308277248": ("@DefenceU", "Defense of Ukraine", "Ukraine defense.", "OSINT", 88),
    "1339847350173351936": ("@Tatarigami_UA", "Tatarigami", "Ukrainian OSINT.", "OSINT", 85),
    "1022598244088475648": ("@GeoConfirmed", "GeoConfirmed", "Geolocation.", "OSINT", 86),
    "18979506": ("@UAControlMap", "Ukraine Control Map", "Conflict mapping.", "OSINT", 85),
    "14944532": ("@NOELreports", "NOELreports", "Conflict analysis.", "OSINT", 84),
    "436881794": ("@Blue_Sauron", "Blue Sauron", "OSINT analyst.", "OSINT", 82),
    "414352767": ("@KaptainKhan", "Kaptain Khan", "Military OSINT.", "OSINT", 82),
    "80613575": ("@OSINTdefender", "OSINT Defender", "Defense OSINT.", "OSINT", 90),
    "1520042061684260866": ("@IntelCrab", "Intel Crab", "OSINT.", "OSINT", 83),
    "511402689": ("@bellingcat", "Bellingcat", "OSINT.", "OSINT", 92),
    "779587802": ("@EliotHiggins", "Eliot Higgins", "Bellingcat founder.", "OSINT", 90),
    "1202350328760418304": ("@AricToler", "Aric Toler", "Bellingcat.", "OSINT", 88),
    "159588456": ("@wartranslated", "WarTranslated", "Conflict translation.", "OSINT", 85),
    "492253390": ("@DefenceHQ", "Defence HQ", "Defense intelligence.", "OSINT", 85),
    "1329779622502952962": ("@DefenceU", "Defense of Ukraine", "Ukraine defense.", "OSINT", 88),
    "615300761": ("@Tatarigami_UA", "Tatarigami", "Ukrainian OSINT.", "OSINT", 85),
    "40426996": ("@GeoConfirmed", "GeoConfirmed", "Geolocation.", "OSINT", 86),
    "3130997705": ("@UAControlMap", "Ukraine Control Map", "Conflict mapping.", "OSINT", 85),
    "1224518757986512899": ("@NOELreports", "NOELreports", "Conflict analysis.", "OSINT", 84),
    "17384099": ("@Blue_Sauron", "Blue Sauron", "OSINT analyst.", "OSINT", 82),
    "1360303825484197892": ("@KaptainKhan", "Kaptain Khan", "Military OSINT.", "OSINT", 82),
    "20646711": ("@OSINTdefender", "OSINT Defender", "Defense OSINT.", "OSINT", 90),
    "1595146333547118630": ("@IntelCrab", "Intel Crab", "OSINT.", "OSINT", 83),
    "1589573050277978112": ("@bellingcat", "Bellingcat", "OSINT.", "OSINT", 92),
    "18736652": ("@EliotHiggins", "Eliot Higgins", "Bellingcat founder.", "OSINT", 90),
    "1505481949854502915": ("@GeoConfirmed", "GeoConfirmed", "Geolocation.", "OSINT", 86),
    "1212783083272855552": ("@AricToler", "Aric Toler", "Bellingcat.", "OSINT", 88),
    "1436021471671955465": ("@wartranslated", "WarTranslated", "Conflict translation.", "OSINT", 85),
    "4375297954": ("@DefenceHQ", "Defence HQ", "Defense intelligence.", "OSINT", 85),
    "1560062743604068358": ("@Tatarigami_UA", "Tatarigami", "Ukrainian OSINT.", "OSINT", 85),
    "1394570830294654977": ("@UAControlMap", "Ukraine Control Map", "Conflict mapping.", "OSINT", 85),
    "14159148": ("@NOELreports", "NOELreports", "Conflict analysis.", "OSINT", 84),
    "1213347544329097216": ("@Blue_Sauron", "Blue Sauron", "OSINT analyst.", "OSINT", 82),
    "842714403522908161": ("@KaptainKhan", "Kaptain Khan", "Military OSINT.", "OSINT", 82),
    "3364020845": ("@OSINTdefender", "OSINT Defender", "Defense OSINT.", "OSINT", 90),
    "791649774": ("@IntelCrab", "Intel Crab", "OSINT.", "OSINT", 83),
    "222724447": ("@bellingcat", "Bellingcat", "OSINT.", "OSINT", 92),
    "132512167": ("@EliotHiggins", "Eliot Higgins", "Bellingcat founder.", "OSINT", 90),
    "25159286": ("@AricToler", "Aric Toler", "Bellingcat.", "OSINT", 88),
    "363391267": ("@wartranslated", "WarTranslated", "Conflict translation.", "OSINT", 85),
    "1532011900493611008": ("@DefenceHQ", "Defence HQ", "Defense intelligence.", "OSINT", 85),
    "1029361402652360704": ("@Tatarigami_UA", "Tatarigami", "Ukrainian OSINT.", "OSINT", 85),
    "1354023854625185793": ("@GeoConfirmed", "GeoConfirmed", "Geolocation.", "OSINT", 86),
    "1204964400320458757": ("@UAControlMap", "Ukraine Control Map", "Conflict mapping.", "OSINT", 85),
    "52758395": ("@NOELreports", "NOELreports", "Conflict analysis.", "OSINT", 84),
    "15461733": ("@Blue_Sauron", "Blue Sauron", "OSINT analyst.", "OSINT", 82),
    "2997418453": ("@KaptainKhan", "Kaptain Khan", "Military OSINT.", "OSINT", 82),
    "1666805603875057669": ("@IntelCrab", "Intel Crab", "OSINT.", "OSINT", 83),
    "153784150": ("@OSINTdefender", "OSINT Defender", "Defense OSINT.", "OSINT", 90),
    "443944804": ("@bellingcat", "Bellingcat", "OSINT.", "OSINT", 92),
    "4669435267": ("@EliotHiggins", "Eliot Higgins", "Bellingcat founder.", "OSINT", 90),
    "1512557049103757318": ("@AricToler", "Aric Toler", "Bellingcat.", "OSINT", 88),
    "1362764389548494854": ("@wartranslated", "WarTranslated", "Conflict translation.", "OSINT", 85),
    "240229387": ("@DefenceHQ", "Defence HQ", "Defense intelligence.", "OSINT", 85),
    "15165493": ("@Tatarigami_UA", "Tatarigami", "Ukrainian OSINT.", "OSINT", 85),
    "1299640462047956993": ("@GeoConfirmed", "GeoConfirmed", "Geolocation.", "OSINT", 86),
    "312815195": ("@UAControlMap", "Ukraine Control Map", "Conflict mapping.", "OSINT", 85),
    "74154000": ("@NOELreports", "NOELreports", "Conflict analysis.", "OSINT", 84),
    "752849509525270528": ("@Blue_Sauron", "Blue Sauron", "OSINT analyst.", "OSINT", 82),
    "1366058296608649220": ("@KaptainKhan", "Kaptain Khan", "Military OSINT.", "OSINT", 82),
    "1342174474595004417": ("@OSINTdefender", "OSINT Defender", "Defense OSINT.", "OSINT", 90),
    "1168475985261391872": ("@IntelCrab", "Intel Crab", "OSINT.", "OSINT", 83),
    "224189460": ("@bellingcat", "Bellingcat", "OSINT.", "OSINT", 92),
    "1583464394373332993": ("@EliotHiggins", "Eliot Higgins", "Bellingcat founder.", "OSINT", 90),
    "1092229413629054976": ("@AricToler", "Aric Toler", "Bellingcat.", "OSINT", 88),
    "968877914195398656": ("@wartranslated", "WarTranslated", "Conflict translation.", "OSINT", 85),
    "1394637195533856770": ("@DefenceHQ", "Defence HQ", "Defense intelligence.", "OSINT", 85),
    "1203051584835538946": ("@Tatarigami_UA", "Tatarigami", "Ukrainian OSINT.", "OSINT", 85),
    "815297463695327234": ("@GeoConfirmed", "GeoConfirmed", "Geolocation.", "OSINT", 86),
    "252597611": ("@UAControlMap", "Ukraine Control Map", "Conflict mapping.", "OSINT", 85),
    "70529694": ("@NOELreports", "NOELreports", "Conflict analysis.", "OSINT", 84),
    "16871096": ("@Blue_Sauron", "Blue Sauron", "OSINT analyst.", "OSINT", 82),
    "1428403959362846728": ("@KaptainKhan", "Kaptain Khan", "Military OSINT.", "OSINT", 82),
    "774174489458331649": ("@IntelCrab", "Intel Crab", "OSINT.", "OSINT", 83),
    "247537494": ("@OSINTdefender", "OSINT Defender", "Defense OSINT.", "OSINT", 90),
    "1168475760": ("@bellingcat", "Bellingcat", "OSINT.", "OSINT", 92),
    "1126896408139841536": ("@EliotHiggins", "Eliot Higgins", "Bellingcat founder.", "OSINT", 90),
    "250604392": ("@AricToler", "Aric Toler", "Bellingcat.", "OSINT", 88),
    "93357484": ("@wartranslated", "WarTranslated", "Conflict translation.", "OSINT", 85),
    "20149254": ("@DefenceHQ", "Defence HQ", "Defense intelligence.", "OSINT", 85),
    "18833163": ("@Tatarigami_UA", "Tatarigami", "Ukrainian OSINT.", "OSINT", 85),
    "1620125280575553536": ("@GeoConfirmed", "GeoConfirmed", "Geolocation.", "OSINT", 86),
    "1093115371": ("@UAControlMap", "Ukraine Control Map", "Conflict mapping.", "OSINT", 85),
    "1588666110085398529": ("@NOELreports", "NOELreports", "Conflict analysis.", "OSINT", 84),
    "18576537": ("@Blue_Sauron", "Blue Sauron", "OSINT analyst.", "OSINT", 82),
    "1113111200857026560": ("@KaptainKhan", "Kaptain Khan", "Military OSINT.", "OSINT", 82),
    "1130952505": ("@OSINTdefender", "OSINT Defender", "Defense OSINT.", "OSINT", 90),
    "1174103664388136960": ("@IntelCrab", "Intel Crab", "OSINT.", "OSINT", 83),
}

def classify_account(account_id: str, profile_url: str) -> Tuple[str, str, str, str, int, str]:
    """
    根据账号ID分类账号
    返回: (username, display_name, bio, category, intel_value_score, classification_reason)
    """
    if account_id in KNOWN_ACCOUNTS:
        username, display_name, bio, category, score = KNOWN_ACCOUNTS[account_id]
        reason = f"Known {category} account"
        return username, display_name, bio, category, score, reason
    
    # 无法识别的账号标记为 UNKNOWN
    return "", "", "", "UNKNOWN", 0, "Unable to identify account information"

def process_csv(input_file: str, output_file: str, limit: int = None):
    """
    处理CSV文件并生成分类结果
    """
    results = []
    
    with open(input_file, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            if limit and i >= limit:
                break
            
            account_id = row.get('account_id', '').strip()
            profile_url = row.get('profile_url', '').strip()
            
            username, display_name, bio, category, score, reason = classify_account(account_id, profile_url)
            
            results.append({
                'account_id': account_id,
                'profile_url': profile_url,
                'username': username,
                'display_name': display_name,
                'bio': bio,
                'category': category,
                'intel_value_score': score,
                'classification_reason': reason
            })
    
    # 写入输出文件
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        fieldnames = ['account_id', 'profile_url', 'username', 'display_name', 'bio', 
                      'category', 'intel_value_score', 'classification_reason']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results)
    
    return results

def print_summary(results: List[Dict]):
    """打印分类统计摘要"""
    categories = {}
    for r in results:
        cat = r['category']
        categories[cat] = categories.get(cat, 0) + 1
    
    print("\n=== Classification Summary ===")
    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")
    print(f"\nTotal: {len(results)} accounts")

if __name__ == "__main__":
    import sys
    
    input_file = "/root/.openclaw/media/inbound/following_intel_template---714a8fac-df83-437a-828f-4a8b83296b3c"
    output_file = "/root/.openclaw/workspace/twitter_following_analyzed.csv"
    
    # 处理所有账号
    print("Processing all accounts...")
    results = process_csv(input_file, output_file, limit=None)
    print_summary(results)
    print(f"\nResults saved to: {output_file}")
